import { createContext, useContext, useState } from 'react';
import { esMX } from '../translations/es-mx';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('es-mx');
  const [translations] = useState(esMX);

  const value = {
    language,
    setLanguage,
    t: (key) => translations[key] || key
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
} 