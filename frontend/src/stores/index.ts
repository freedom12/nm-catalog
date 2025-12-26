import { defineStore } from 'pinia';
import { CACHENAME, DEFAULT_LANG, type LangCodeValue } from '@/types';

export const useStore = defineStore('app', {
  state: () => ({
    mainLang: (localStorage.getItem(CACHENAME.LANG) || DEFAULT_LANG) as LangCodeValue,
    langList: [] as LangCodeValue[],
  }),
  actions: {
    setMainLang(lang: LangCodeValue) {
      this.mainLang = lang;
      localStorage.setItem(CACHENAME.LANG, lang);
    },
    setLangList(data: LangCodeValue[]) {
      this.langList = data;
    },
  },
});
