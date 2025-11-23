import { LangCode, type PlaylistType } from './enums';
import { useStore } from '@/stores';

export class LocalizationString {
  private localizationMap: { [key: string]: string } = {};
  private defaultLangCode: string = LangCode.en_US;
  constructor(
    data?: any,
    prefix: string = '',
    suffix: string = '',
    isAutoAddUnderscore: boolean = true
  ) {
    if (!data) {
      return;
    }
    for (const langCode of Object.values(LangCode)) {
      if (isAutoAddUnderscore) {
        prefix = prefix && !prefix.endsWith('_') ? `${prefix}_` : prefix;
        suffix = suffix && !suffix.startsWith('_') ? `_${suffix}` : suffix;
      }
      const key = `${prefix}${langCode}${suffix}`;
      if (!(key in data)) {
        continue;
      }
      this.localizationMap[langCode] = data[key];
    }
  }

  set(langCode: string, value: string) {
    langCode = this.convertLangCode(langCode);
    this.localizationMap[langCode] = value;
  }

  get(langCode?: string): string {
    langCode = this.convertLangCode(langCode);
    return (
      this.localizationMap[langCode] || this.localizationMap[this.defaultLangCode] || ''
    );
  }

  has(langCode: string): boolean {
    langCode = this.convertLangCode(langCode);
    return langCode in this.localizationMap;
  }

  toString(): string {
    return this.get();
  }

  private convertLangCode(langCode?: string): string {
    langCode = langCode ? langCode : useStore().mainLang;
    return langCode.replace('-', '_');
  }
}

// interface WithLangData {
//   title_de_DE: string;
//   title_en_US: string;
//   title_es_ES: string;
//   title_fr_FR: string;
//   title_it_IT: string;
//   title_ja_JP: string;
//   title_ko_KR: string;
//   title_zh_CN: string;
//   title_zh_TW: string;
//   img_de_DE: string;
//   img_en_US: string;
//   img_es_ES: string;
//   img_fr_FR: string;
//   img_it_IT: string;
//   img_ja_JP: string;
//   img_ko_KR: string;
//   img_zh_CN: string;
//   img_zh_TW: string;
// }

export type MultiLangField<Name extends string> = {
  [key in `${Name}_${LangCode}`]: string;
};

export interface Game extends MultiLangField<'title'>, MultiLangField<'img'> {
  id: string;
  year: number;
  hardware: string;
  link: string;
  inserted: number;
}

export interface Track extends MultiLangField<'title'>, MultiLangField<'img'> {
  id: string;
  gid?: string;
  idx: number;
  duration: string;
  isloop: number;
  isbest: number;
}

export interface Playlist extends MultiLangField<'title'>, MultiLangField<'img'> {
  id: string;
  type: PlaylistType;
  tracksNum: number;
  isRelatedGame: number;
  desc?: LocalizationString; //type为MULTIPLE/SPECIAL/LOOP时可能存在
  gid?: string; //type为SINGLE_GAME_ALL/SINGLE_GAME/LOOP/BEST时存在
}

export interface Lang {
  id: string;
  desc: string;
}

export interface Hardware {
  name: string;
  year: number;
}

export const MAIN_TITLE = 'Nintendo Music Catalog';
