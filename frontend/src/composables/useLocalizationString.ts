import { ref } from 'vue';
import { useLangStore } from '@/stores';
import { type LangCodeValue, type NMData } from '@/types';
import { LocalizationString } from '@/utils/localization-string';

const stringMap = ref(new Map<string, LocalizationString>());

const api = {
  setData(data: NMData[], propName: string) {
    for (const item of data) {
      const key = `${item.id}:${propName}`;
      if (!stringMap.value.has(key)) {
        const ls = new LocalizationString(item, propName);
        stringMap.value.set(key, ls);
      }
    }
    return api;
  },
  getString(data: NMData, propName: string, lang?: LangCodeValue): string {
    if (!data) {
      return '';
    }
    const key = `${data.id}:${propName}`;
    return stringMap.value.get(key)?.get(lang ?? useLangStore().mainLang) ?? '';
  },
};

export const useLocalizationString = () => api;
