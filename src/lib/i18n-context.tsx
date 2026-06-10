import { createContext, useContext, useState, useCallback } from 'react';
import type { Locale } from './i18n';
import { t, translations } from './i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (path: string) => string;
  locales: { code: Locale; name: string }[];
  isChinese: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
  translate: () => '',
  locales: [],
  isChinese: true,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem('cc-locale') as Locale) || 'zh';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('cc-locale', l);
    document.documentElement.lang = l;
  }, []);

  const translate = useCallback((path: string) => t(locale, path), [locale]);

  const locales = Object.keys(translations).map(code => ({
    code: code as Locale,
    name: code === 'zh' ? '中文' : 'English',
  }));

  return (
    <I18nContext.Provider value={{ locale, setLocale, translate, locales, isChinese: locale === 'zh' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
