import { DEFAULT_LANG } from '@/types';
import { createI18n } from 'vue-i18n';

export const SUPPORT_LOCALES = ['en-US', 'zh-CN', 'zh-TW'] as const;
export type LocaleType = (typeof SUPPORT_LOCALES)[number];

const loaded: LocaleType[] = [];
const loaders = Object.fromEntries(
  SUPPORT_LOCALES.map((lang) => [lang, () => import(`./lang/${lang}.json`)])
);

export const loadLocaleMessage = async (locale: LocaleType) => {
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
