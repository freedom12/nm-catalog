import { DEFAULT_LANG } from '@/types';
import { createI18n } from 'vue-i18n';

export const SUPPORT_LOCALES = ['zh-CN', 'en-US'] as const;
export type Locale = (typeof SUPPORT_LOCALES)[number];

const loaded: Locale[] = [];
const loaders = {
  'zh-CN': () => import('./lang/zh-CN.json'),
  'en-US': () => import('./lang/en-US.json'),
};

export const loadLocaleMessage = async (locale: Locale) => {
  if (loaded.includes(locale)) {
    return;
  }
  const moudle = await loaders[locale]();
  i18n.global.setLocaleMessage(locale, moudle.default || moudle);
  loaded.push(locale);
};

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LANG,
  fallbackLocale: DEFAULT_LANG,
  messages: {},
});
