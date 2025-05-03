import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Profile() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    photoURL: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData({
            name: userDoc.data().name || '',
            phone: userDoc.data().phone || '',
            photoURL: currentUser.photoURL || '',
          });
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userData.name,
        phone: userData.phone,
        updatedAt: new Date(),
      });
      setSuccess(t('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
    } catch {
      setError(t('profileUpdateError'));
      setTimeout(() => setError(''), 3000);
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
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: new Date(),
      });

      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      setSuccess(t('photoUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError(t('photoUpdateError'));
      setTimeout(() => setError(''), 3000);
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
    return <div className="flex justify-center items-center h-64">{t('loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-white">{t('profile')}</h2>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <div className="border-t border-gray-700">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {userData.photoURL ? (
                    <img
                      className="h-24 w-24 rounded-full border-2 border-indigo-500"
                      src={userData.photoURL}
                      alt=""
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500">
                      {getInitials(userData.name)}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-600">
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
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                      {t('phone')} ({t('optional')})
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-600 text-gray-300 shadow-sm text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('save')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">{t('name')}</h4>
                    <p className="mt-1 text-sm text-white">{userData.name || t('notSet')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">{t('phone')}</h4>
                    <p className="mt-1 text-sm text-white">{userData.phone || t('notSet')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">{t('email')}</h4>
                    <p className="mt-1 text-sm text-white">{currentUser.email}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('editProfile')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 