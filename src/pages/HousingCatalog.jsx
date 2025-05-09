import { useLanguage } from '../contexts/LanguageContext';

export default function HousingCatalog() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-4 sm:py-8">
        <div className="bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-white">{t('housingCatalog')}</h2>
            <p className="mt-2 text-sm text-gray-300">{t('housingCatalogDescription')}</p>
          </div>
          <div className="border-t border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center text-gray-400">
                <p>{t('comingSoon')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 