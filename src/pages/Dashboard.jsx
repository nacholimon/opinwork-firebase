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

  const role = userInfo?.role || 'user';

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