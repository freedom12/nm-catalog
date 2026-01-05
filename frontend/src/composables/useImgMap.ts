import { ref } from 'vue';
import { DEFAULT_LANG, LangCode, type LangCodeValue, type NMData } from '@/types';
import { useLangStore } from '@/stores';
import { LocalizationString } from '@/utils/localization-string';
import { fallbackSrc } from '@/plugins/fallbackImage';

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
    const key = `${dataType}:${data.id}:${lang ?? useLangStore().mainLang}`;
    const alterKey = `${dataType}:${data.id}:${DEFAULT_LANG}`;
    return imgMap.value.get(key) ?? imgMap.value.get(alterKey) ?? fallbackSrc;
  },
};

export const useImgMap = () => api;
