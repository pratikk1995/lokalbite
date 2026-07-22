'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language on mount
    const saved = localStorage.getItem('lokabite_language');
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lokabite_language', lang);
  };

  const t = (key) => {
    if (!mounted) return key; // Return english default during SSR to prevent hydration mismatch
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
