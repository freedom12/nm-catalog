import { defineStore } from 'pinia';
import { STORAGE_KEY, DEFAULT_LANG, type LangCodeValue, LangCode } from '@/types';
import { i18n, loadLocaleMessage, SUPPORT_LOCALES, type LocaleType } from '@/i18n';

export const getInitialLang = (): LangCodeValue => {
  const LangCodes = Object.values(LangCode);
  let navLang = navigator.language;
  let matchLang = LangCodes.find((x) => x === navLang);
  if (matchLang) {
    return matchLang;
  }
  navLang = navLang.slice(0, 2);
  if (navLang === 'zh') {
    return LangCode.zh_CN;
  }
  matchLang = LangCodes.find((x) => x.slice(0, 2) === navLang);
  return matchLang ?? DEFAULT_LANG;
};

export const getLocale = (locale?: LocaleType): LocaleType => {
  if (!locale) {
    const cache = localStorage.getItem(STORAGE_KEY.LOCALE);
    if (cache) {
      return cache as LocaleType;
    } else {
      const navLang = navigator.language;
      if ((SUPPORT_LOCALES as unknown as string[]).includes(navLang)) {
        return navLang as LocaleType;
      } else {
        return DEFAULT_LANG;
      }
    }
  } else {
    return SUPPORT_LOCALES.includes(locale) ? locale : DEFAULT_LANG;
  }
};

export const useLangStore = defineStore('lang', {
  state: () => ({
    locale: getLocale(),
    mainLang: (localStorage.getItem(STORAGE_KEY.LANG) ||
      getInitialLang()) as LangCodeValue,
    langList: [] as LangCodeValue[],
  }),
  actions: {
    async setLocale(locale: LocaleType, isManual = false) {
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
