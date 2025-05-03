import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">{t('welcome')}</h1>
      <p className="text-xl mb-8">{t('subtitle')}</p>
      {!currentUser && (
        <Link
          to="/login"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('getStarted')}
        </Link>
      )}
    </div>
  );
} 