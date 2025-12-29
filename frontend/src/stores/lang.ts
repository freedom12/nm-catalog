import { defineStore } from 'pinia';
import { STORAGE_KEY, DEFAULT_LANG, type LangCodeValue } from '@/types';
import { i18n, loadLocaleMessage, SUPPORT_LOCALES, type Locale } from '@/i18n';

const getLocale = (): Locale => {
  const cache = localStorage.getItem(STORAGE_KEY.LOCALE);
  if (cache) {
    return cache as Locale;
  } else {
    const navLang = navigator.language;
    if ((SUPPORT_LOCALES as unknown as string[]).includes(navLang)) {
      return navLang as Locale;
    } else {
      if (navLang.includes('zh')) {
        return 'zh-CN';
      } else {
        return DEFAULT_LANG;
      }
    }
  }
};

export const useLangStore = defineStore('lang', {
  state: () => ({
    locale: getLocale(),
    mainLang: (localStorage.getItem(STORAGE_KEY.LANG) || DEFAULT_LANG) as LangCodeValue,
    langList: [] as LangCodeValue[],
  }),
  actions: {
    async setLocale(locale: Locale, isManual = false) {
      await loadLocaleMessage(locale);
      i18n.global.locale.value = locale;
      this.locale = locale;
      document.documentElement.setAttribute('lang', locale);
      if (isManual) {
        localStorage.setItem(STORAGE_KEY.LOCALE, locale);
      }
    },
    setMainLang(lang: LangCodeValue) {
      this.mainLang = lang;
      localStorage.setItem(STORAGE_KEY.LANG, lang);
    },
    setLangList(data: LangCodeValue[]) {
      this.langList = data;
    },
  },
});
