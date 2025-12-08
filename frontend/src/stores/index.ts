import { defineStore } from 'pinia';
import { DEFAULT_LANG, type LangCodeValue } from '@/types';

export const useStore = defineStore('app', {
  state: () => ({
    mainLang: (localStorage.getItem('lang') || DEFAULT_LANG) as LangCodeValue,
    langList: [] as LangCodeValue[],
  }),
  actions: {
    setMainLang(lang: LangCodeValue) {
      this.mainLang = lang;
      localStorage.setItem('lang', lang);
    },
    setLangList(data: LangCodeValue[]) {
      this.langList = data;
    },
  },
});
