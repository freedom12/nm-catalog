import { useStore } from '@/stores';
import { LocalizationString, type Track } from '@/types';

export const getLocalizationString = (target: any, name: string): LocalizationString => {
  return new LocalizationString(target, name);
}

export const getLangTitle = (target: any, lang: string): string => {
  return getLocalizationString(target, 'title').get(lang);
}

export const getLangDesc = (target: any, lang: string): string => {
  return getLocalizationString(target, 'desc').get(lang);
}

export const isShowTitle = (target: any, lang: string): boolean => {
  const mainLang = useStore().mainLang;
  if (lang === 'en-US' && mainLang !== 'en-US') { return true; }
  if (lang === mainLang) { return false; }
  lang = lang.replace('-', '_');
  return target[`title_${lang}`] !== target['title_en_US'];
}

export const getImgSrc = (target: any, lang: string): string => {
  const mainLang = 'en-US',
    fileName = target[`img_${lang.replace('-', '_')}`],
    mainFileName = target['img_en_US'];
  const result = `/assets/img_${fileName === mainFileName ? mainLang : lang}/${fileName}.jpg`;
  return result;
}

export const openSourceImg = (target: any, lang: string) => {
  window.open(`https://image-assets.m.nintendo.com/${target[`img_${lang.replace('-', '_')}`]}`, '_blank')
}

export const getTotalDuration = (tracks?: Track[]): string => {
  if (!tracks || tracks.length === 0) {
    return '0:00';
  }
  let totalSeconds = 0;
  for (const track of tracks) {
    const parts = track.duration.split(':').map(part => parseInt(part, 10));
    if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}