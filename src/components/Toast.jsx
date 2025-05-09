import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-900' : 'bg-red-900';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const textColor = type === 'success' ? 'text-green-200' : 'text-red-200';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out`}>
      <div className="flex-1">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-current hover:opacity-75 focus:outline-none"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 