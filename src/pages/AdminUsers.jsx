import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminUsers() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [expirationDays, setExpirationDays] = useState(3);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
    } catch (error) {
      console.error('Error generating invitation:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('adminUsers')}</h1>
      </div>

      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('users')}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`${
              activeTab === 'invitations'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('invitations')}
          </button>
        </nav>
      </div>

      {activeTab === 'users' && (
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('email')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('role')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('phone')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                        className="bg-gray-700 text-gray-300 rounded-md px-2 py-1 w-full sm:w-auto"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <input
                        type="text"
                        value={user.phone || ''}
                        onChange={(e) => handleUpdateUser(user.id, { phone: e.target.value })}
                        className="bg-gray-700 text-gray-300 rounded-md px-2 py-1 w-full sm:w-auto"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleUpdateUser(user.id, { active: !user.active })}
                        className={`${
                          user.active ? 'bg-green-600' : 'bg-red-600'
                        } text-white px-3 py-1 rounded-md w-full sm:w-auto`}
                      >
                        {user.active ? t('deactivate') : t('activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="space-y-6">
          <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:w-auto">
                <label htmlFor="expiration-days" className="block text-sm font-medium text-gray-300">
                  {t('expirationDays')}
                </label>
                <select
                  id="expiration-days"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-700 text-gray-300"
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
                className="mt-6 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('generateInvitation')}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('invitationLink')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('createdAt')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('expiresAt')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            type="text"
                            readOnly
                            value={invitation.link}
                            className="bg-gray-700 text-gray-300 rounded-md px-2 py-1 flex-grow"
                          />
                          <button
                            onClick={() => navigator.clipboard.writeText(invitation.link)}
                            className="text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-md bg-gray-700"
                          >
                            {t('copy')}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(invitation.createdAt?.toDate()).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(invitation.expiresAt?.toDate()).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {invitation.used ? (
                          <span className="text-red-400">{t('used')}</span>
                        ) : new Date(invitation.expiresAt?.toDate()) < new Date() ? (
                          <span className="text-yellow-400">{t('expired')}</span>
                        ) : (
                          <span className="text-green-400">{t('active')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 