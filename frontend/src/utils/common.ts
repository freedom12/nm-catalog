import { useStore } from '../stores';

export const getLangTitle = (target: any, lang: string): string => {
  lang = lang.replace('-', '_');
  return target[`title_${lang}`];
}

export const isShowTitle = (target: any, lang: string): boolean => {
  const mainLang = useStore().mainLang;
  if (lang === 'en-US' && mainLang !== 'en-US') { return true; }
  if (lang === mainLang) { return false; }
  lang = lang.replace('-', '_');
  return target[`title_${lang}`] !== target['title_en_US'];
}

export const openSourceImg = (path: string) => {
  window.open(`https://image-assets.m.nintendo.com/${path}`, '_blank')
}
