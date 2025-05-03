import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const { currentUser } = useAuth();
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const avatarUrl = currentUser.photoURL;
  const displayName = currentUser.displayName || (userInfo && userInfo.email) || 'User';
  const role = userInfo?.role || 'user';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center space-x-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-16 h-16 rounded-full border-2 border-indigo-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500">
                {initials}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-gray-900">{displayName}</div>
              <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">
                {role}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {currentUser.email}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Account created
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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