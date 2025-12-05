import { defineStore } from 'pinia';
import { LangCode, type LangCodeValue } from '@/types';

export const useStore = defineStore('app', {
  state: () => ({
    mainLang: (localStorage.getItem('lang') || LangCode.en_US) as LangCodeValue,
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
