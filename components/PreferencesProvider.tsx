'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getPreferences, type Language, type Theme } from '@/lib/preferences';
import { translations, type TranslationKey } from '@/lib/translations';

interface PreferencesContextType {
  language: Language;
  theme: Theme;
  t: (key: TranslationKey) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const prefs = getPreferences();
    setLanguage(prefs.language);
    setTheme(prefs.theme);
    
    // Apply theme
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <PreferencesContext.Provider value={{ language, theme, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
