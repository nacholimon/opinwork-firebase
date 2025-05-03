import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setRole(userDoc.exists() ? userDoc.data().role : null);
        setLoading(false);
      }
    };
    fetchRole();
  }, [currentUser]);

  if (!currentUser) return <Navigate to="/" />;
  if (loading) return <div className="flex justify-center items-center h-64">{t('loading')}</div>;
  if (role !== 'admin') return <Navigate to="/dashboard" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{t('adminDashboard')}</h2>
          <p className="mb-4">{t('adminWelcome')}</p>
          {/* User administration features will go here */}
        </div>
      </div>
    </div>
  );
} 