import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import Toast from '../components/Toast';

export default function AdminUsers() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [expirationDays, setExpirationDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editedUserData, setEditedUserData] = useState(null);

  useEffect(() => {
    loadUsers();
    loadInvitations();
    setLoading(false);
  }, []);

  const loadUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadInvitations = async () => {
    const invitationsSnapshot = await getDocs(collection(db, 'invitations'));
    setInvitations(invitationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleUpdateUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), editedUserData);
      await loadUsers();
      setNotification({
        message: t('userUpdated'),
        type: 'success'
      });
      setEditingUser(null);
      setEditedUserData(null);
      setExpandedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({
        message: t('userUpdateError'),
        type: 'error'
      });
    }
  };

  const handleStartEditing = (user) => {
    setEditingUser(user.id);
    setEditedUserData({
      role: user.role,
      phone: user.phone || ''
    });
  };

  const handleCancelEditing = () => {
    setEditingUser(null);
    setEditedUserData(null);
  };

  const handleInputChange = (field, value) => {
    setEditedUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateInvitation = async () => {
    try {
      const invitationRef = await addDoc(collection(db, 'invitations'), {
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        used: false,
        usedBy: null,
        usedAt: null
      });
      
      const invitationId = invitationRef.id;
      const invitationLink = `${window.location.origin}/register?invitation=${invitationId}`;
      
      await updateDoc(doc(db, 'invitations', invitationId), {
        link: invitationLink
      });
      
      await loadInvitations();
      setNotification({
        message: t('invitationGenerated'),
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating invitation:', error);
      setNotification({
        message: t('invitationGenerationError'),
        type: 'error'
      });
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
      await loadUsers();
      setNotification({
        message: !currentStatus ? t('userActivated') : t('userDeactivated'),
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setNotification({
        message: t('userStatusUpdateError'),
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const UserCard = ({ user }) => {
    const isExpanded = expandedUser === user.id;
    const isEditing = editingUser === user.id;

    const handlePhoneChange = (e) => {
      handleInputChange('phone', e.target.value);
    };

    const handleCardClick = (e) => {
      if (!e.target.closest('input') && !e.target.closest('button')) {
        setExpandedUser(isExpanded ? null : user.id);
      }
    };

    return (
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div 
          className="p-4 hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold border-2 border-blue-500">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-gray-700 ${
                  user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                } flex items-center justify-center text-[10px] font-bold text-white`} 
                title={user.role === 'admin' ? t('admin') : t('user')}
                >
                  {user.role === 'admin' ? 'A' : 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || t('noName')}</p>
                <p className="text-sm text-gray-300 truncate">{user.email}</p>
              </div>
            </div>
            <button
              className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedUser(isExpanded ? null : user.id);
              }}
            >
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-600 p-4" onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">{t('role')}</label>
                  <select
                    value={editedUserData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                  >
                    <option value="user">{t('user')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">{t('phone')}</label>
                  <input
                    type="tel"
                    value={editedUserData.phone}
                    onChange={handlePhoneChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-white"
                    placeholder={t('noPhone')}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEditing}
                    className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => handleUpdateUser(user.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {t('save')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('name')}</label>
                    <p className="mt-1 text-sm text-white">{user.name || t('noName')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('email')}</label>
                    <p className="mt-1 text-sm text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('phone')}</label>
                    <p className="mt-1 text-sm text-white">{user.phone || t('noPhone')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('role')}</label>
                    <p className="mt-1 text-sm text-white capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('lastLogin')}</label>
                    <p className="mt-1 text-sm text-white">
                      {user.lastLoginAt ? new Date(user.lastLoginAt.toDate()).toLocaleString() : t('notSet')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('accountCreated')}</label>
                    <p className="mt-1 text-sm text-white">
                      {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleString() : t('notSet')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">{t('status')}</label>
                    <div className="mt-1 flex items-center space-x-3">
                      <p className="text-sm text-white">
                        {user.isActive ? t('active') : t('deactivated')}
                      </p>
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          user.isActive ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={user.isActive}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleStartEditing(user)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {t('edit')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4">
            {t('adminUsers')}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {t('manageUsersAndInvitations')}
          </p>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                {t('users')}
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`${
                  activeTab === 'invitations'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                {t('invitations')}
              </button>
            </nav>
          </div>

          {activeTab === 'users' && (
            <div className="p-4 sm:p-6 space-y-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="p-4 sm:p-6 space-y-6">
              <div className="bg-gray-700 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:w-auto">
                    <label htmlFor="expiration-days" className="block text-sm font-medium text-gray-300">
                      {t('expirationDays')}
                    </label>
                    <select
                      id="expiration-days"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-800 text-white"
                    >
                      <option value={1}>1 {t('day')}</option>
                      <option value={3}>3 {t('days')}</option>
                      <option value={7}>7 {t('days')}</option>
                      <option value={14}>14 {t('days')}</option>
                      <option value={30}>30 {t('days')}</option>
                    </select>
                  </div>
                  <button
                    onClick={generateInvitation}
                    className="mt-6 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {t('generateInvitation')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400">{t('invitationLink')}</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <input
                            type="text"
                            readOnly
                            value={invitation.link}
                            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-800 text-white"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(invitation.link);
                              setNotification({
                                message: t('linkCopied'),
                                type: 'success'
                              });
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            {t('copy')}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">{t('createdAt')}</label>
                        <p className="mt-1 text-sm text-white">
                          {new Date(invitation.createdAt?.toDate()).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">{t('expiresAt')}</label>
                        <p className="mt-1 text-sm text-white">
                          {new Date(invitation.expiresAt?.toDate()).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">{t('status')}</label>
                        <p className={`mt-1 text-sm ${
                          invitation.used
                            ? 'text-red-400'
                            : new Date(invitation.expiresAt?.toDate()) < new Date()
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {invitation.used
                            ? t('used')
                            : new Date(invitation.expiresAt?.toDate()) < new Date()
                            ? t('expired')
                            : t('active')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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