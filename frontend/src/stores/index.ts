import { defineStore } from 'pinia';
import type { Lang } from '../types';

export const useStore = defineStore('app', {
  state: () => ({
    mainLang: localStorage.getItem('lang') || 'en-US',
    langList: [] as Lang[]
  }),
  actions: {
    setMainLang(lang: string) {
      this.mainLang = lang;
      localStorage.setItem('lang', lang);
    },
    setLangList(data: Lang[]) {
      this.langList = data;
    }
  },
});
