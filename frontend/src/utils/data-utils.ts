import { useStore } from '@/stores';

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
