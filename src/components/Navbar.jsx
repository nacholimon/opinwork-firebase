import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold tracking-tight text-white">
                OPINwork
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center">
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {userData?.photoURL || currentUser.photoURL ? (
                    <img
                      src={userData?.photoURL || currentUser.photoURL}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {userData?.name
                        ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                        : currentUser.email[0].toUpperCase()}
                    </span>
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 bg-gray-900 ring-1 ring-black ring-opacity-10 focus:outline-none z-50 border border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <span className="text-white font-semibold text-base truncate max-w-[160px] block">{userData?.name || currentUser.email}</span>
                      <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded ${userData?.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{userData?.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white rounded transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {t('profile')}
                      </Link>
                      {userData?.role === 'admin' && (
                        <Link
                          to="/admin-users"
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white rounded transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {t('adminUsers')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded transition-colors"
                      >
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser && (
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('profile')}
              </Link>
            )}
            {currentUser && userData?.role === 'admin' && (
              <Link
                to="/admin-users"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('adminUsers')}
              </Link>
            )}
            {currentUser && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 