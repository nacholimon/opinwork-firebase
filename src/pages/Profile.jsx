import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import Toast from '../components/Toast';

export default function Profile() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    photoURL: '',
    role: '',
    createdAt: null,
    lastLogin: null,
  });
  const [notification, setNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || '',
            phone: data.phone || '',
            photoURL: currentUser.photoURL || '',
            role: data.role || 'user',
            createdAt: data.createdAt?.toDate() || null,
            lastLogin: data.lastLogin?.toDate() || null,
          });
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleSubmit = async (field) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        [field]: userData[field],
        updatedAt: new Date(),
      });
      setNotification({
        message: t('profileUpdated'),
        type: 'success'
      });
      setEditingField(null);
    } catch {
      setNotification({
        message: t('profileUpdateError'),
        type: 'error'
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update photo in Firebase Auth
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Update photo in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: new Date(),
      });

      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      setNotification({
        message: t('photoUpdated'),
        type: 'success'
      });
    } catch {
      setNotification({
        message: t('photoUpdateError'),
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-white">{t('loading')}</div>;
  }

  const EditableField = ({ field, label, value, type = 'text' }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="group relative">
        <h4 className="text-sm font-medium text-gray-400">{label}</h4>
        {isEditing ? (
          <div className="mt-1 flex items-center space-x-2">
            <input
              type={type}
              value={value}
              onChange={(e) => setUserData({ ...userData, [field]: e.target.value })}
              className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmit(field)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-600 text-xs font-medium rounded text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm text-white">{value || t('notSet')}</p>
            <button
              onClick={() => setEditingField(field)}
              className="opacity-0 group-hover:opacity-100 inline-flex items-center px-2.5 py-1.5 border border-gray-600 text-xs font-medium rounded text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4">
            {t('profile')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('manageYourProfile')}
          </p>
        </div>

        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {(userData.photoURL && userData.photoURL.trim() !== '') || (currentUser.photoURL && currentUser.photoURL.trim() !== '') ? (
                  <img
                    className="h-24 w-24 rounded-full border-2 border-blue-500 object-cover bg-gray-700"
                    src={userData.photoURL && userData.photoURL.trim() !== '' ? userData.photoURL : currentUser.photoURL}
                    alt="avatar"
                    onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-500">
                    {getInitials(userData.name)}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{userData.name || t('user')}</h3>
                <p className="text-sm text-gray-400">{currentUser.email}</p>
                <p className="text-sm text-gray-400 capitalize">{t('role')}: {userData.role}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
            <div className="space-y-6">
              <EditableField field="name" label={t('name')} value={userData.name} />
              <EditableField field="phone" label={t('phone')} value={userData.phone} type="tel" />
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">{t('email')}</h4>
                <p className="mt-1 text-sm text-white">{currentUser.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">{t('role')}</h4>
                <p className="mt-1 text-sm text-white capitalize">{userData.role}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">{t('accountCreated')}</h4>
                <p className="mt-1 text-sm text-white">
                  {userData.createdAt ? userData.createdAt.toLocaleDateString() : t('notSet')}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">{t('lastLogin')}</h4>
                <p className="mt-1 text-sm text-white">
                  {userData.lastLogin ? userData.lastLogin.toLocaleDateString() : t('notSet')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 