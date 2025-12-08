import { ref } from 'vue';
import { DEFAULT_LANG, LangCode, type LangCodeValue, type NMData } from '@/types';
import { useStore } from '@/stores';
import { LocalizationString } from '@/utils/localization-string';

type DataTypeName = 'game' | 'track' | 'playlist';

const imgMap = ref(new Map<string, string>());

const api = {
  setData(dataType: DataTypeName, data: NMData[]) {
    for (const lang of Object.values(LangCode)) {
      for (const item of data) {
        if (
          String(lang) === DEFAULT_LANG ||
          (String(lang) !== DEFAULT_LANG &&
            (item as any)[`img_${LocalizationString.convertLangCode(lang)}`] !==
              (item as any)[`img_${LocalizationString.convertLangCode(DEFAULT_LANG)}`])
        ) {
          const key = `${dataType}:${item.id}:${lang}`;
          if (!imgMap.value.has(key)) {
            const fileName = (item as any)[`img_${lang.replace('-', '_')}`];
            const mainFileName = item['img_en_US'];
            const imgPath = `/assets/img_${
              fileName === mainFileName ? DEFAULT_LANG : lang
            }/${fileName}.jpg`;
            imgMap.value.set(key, imgPath);
          }
        }
      }
    }

    return api;
  },
  getPath(dataType: DataTypeName, data: NMData, lang?: LangCodeValue): string {
    const key = `${dataType}:${data.id}:${lang ?? useStore().mainLang}`;
    const alterKey = `${dataType}:${data.id}:${DEFAULT_LANG}`;
    return (
      imgMap.value.get(key) ??
      imgMap.value.get(alterKey) ??
      `data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' stroke='rgba(128,128,128,0.45)' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='4' width='24' height='24' rx='4' ry='4'/%3E%3Cpath d='M10 22l4-4 3 3 5-5'/%3E%3Ccircle cx='12.5' cy='12.5' r='2.2'/%3E%3C/svg%3E`
    );
  },
};

export const useImgMap = () => api;
