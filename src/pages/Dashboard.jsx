import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

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

  const tools = [
    {
      id: 'credit-simulator',
      title: t('creditSimulator'),
      description: t('creditSimulatorDescription'),
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/credit-simulator',
      availableTo: ['user', 'admin']
    },
    {
      id: 'housing-catalog',
      title: t('housingCatalog'),
      description: t('housingCatalogDescription'),
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/housing-catalog',
      availableTo: ['user', 'admin']
    },
    {
      id: 'user-management',
      title: t('userManagement'),
      description: t('userManagementDescription'),
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/admin-users',
      availableTo: ['admin']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 sm:py-8">
        {/* Profile Section */}
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg mb-8">
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

        {/* Tools Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter(tool => tool.availableTo.includes(role))
            .map(tool => (
              <Link
                key={tool.id}
                to={tool.path}
                className="bg-gray-800 shadow overflow-hidden rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {tool.icon}
                    <h3 className="text-lg font-medium text-white">{tool.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-300">{tool.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
} 