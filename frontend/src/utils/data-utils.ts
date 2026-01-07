import { useLangStore } from '@/stores';
import { DEFAULT_LANG, type DurationInfo, type NMData, type Track } from '@/types';
import { LocalizationString } from './localization-string';

export const isShowTitle = (target: NMData, lang: string): boolean => {
  const mainLang = useLangStore().mainLang;
  if (lang === DEFAULT_LANG && mainLang !== DEFAULT_LANG) {
    return true;
  }
  if (lang === mainLang) {
    return false;
  }
  lang = LocalizationString.convertLangCode(lang);
  return (target as any)[`title_${lang}`] !== target['title_en_US'];
};

export const openSourceImg = (target: NMData, lang: string) => {
  window.open(
    `https://image-assets.m.nintendo.com/${
      (target as any)[`img_${LocalizationString.convertLangCode(lang)}`]
    }`,
    '_blank'
  );
};

export const getTotalDuration = (tracks: Track[]): DurationInfo => {
  if (tracks.length === 0) {
    return { hour: 0, minute: 0, second: 0 };
  }
  let totalSeconds = 0;
  for (const track of tracks) {
    const parts = track.duration.split(':').map((part) => parseInt(part, 10));
    if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  const hour = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;
  return { hour, minute, second };
};
