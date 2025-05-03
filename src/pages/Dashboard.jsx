import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserInfo(userDoc.exists() ? userDoc.data() : null);
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-white">{t('loading')}</div>;
  }

  const avatarUrl = currentUser.photoURL;
  const displayName = currentUser.displayName || (userInfo && userInfo.email) || t('user');
  const role = userInfo?.role || 'user';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 sm:py-8">
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-indigo-500"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-2 border-indigo-500">
                  {initials}
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-white">{displayName}</div>
                <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full w-fit">
                  {role}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700">
            <dl className="divide-y divide-gray-700">
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">
                  {t('emailAddress')}
                </dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                  {currentUser.email}
                </dd>
              </div>
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">
                  {t('accountCreated')}
                </dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                  {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 