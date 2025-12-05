import { useStore } from '@/stores';
import { LangCode, type NMData } from '@/types';

export class LocalizationString {
  private localizationMap: Map<string, string> = new Map<string, string>();
  private defaultLangCode: string = LangCode.en_US;

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
      this.localizationMap.get(langCode) ??
      this.localizationMap.get(this.defaultLangCode) ??
      ''
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
    langCode = langCode ? langCode : useStore().mainLang;
    return langCode.replace('-', '_');
  }
}
