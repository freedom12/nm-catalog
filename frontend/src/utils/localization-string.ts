import { useLangStore } from '@/stores';
import { DEFAULT_LANG, LangCode, type NMData } from '@/types';

export class LocalizationString {
  private localizationMap: Map<string, string> = new Map<string, string>();

  constructor(
    data: NMData,
    prefix: string = '',
    suffix: string = '',
    isAutoAddUnderscore: boolean = true
  ) {
    for (const langCode of Object.values(LangCode)) {
      if (isAutoAddUnderscore) {
        prefix = prefix && !prefix.endsWith('_') ? `${prefix}_` : prefix;
        suffix = suffix && !suffix.startsWith('_') ? `_${suffix}` : suffix;
      }
      const key = `${prefix}${LocalizationString.convertLangCode(langCode)}${suffix}`;
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        continue;
      }
      this.localizationMap.set(
        LocalizationString.convertLangCode(langCode),
        (data as any)[key]
      );
    }
  }

  set(langCode: string, value: string) {
    langCode = LocalizationString.convertLangCode(langCode);
    this.localizationMap.set(langCode, value);
  }

  get(langCode?: string): string {
    langCode = LocalizationString.convertLangCode(langCode);
    return (
      this.localizationMap.get(langCode) ?? this.localizationMap.get(DEFAULT_LANG) ?? ''
    );
  }

  has(langCode: string): boolean {
    langCode = LocalizationString.convertLangCode(langCode);
    return this.localizationMap.has(langCode);
  }

  toString(): string {
    return this.get();
  }

  static convertLangCode(langCode?: string): string {
    langCode = langCode ? langCode : useLangStore().mainLang;
    return langCode.replace('-', '_');
  }
}
