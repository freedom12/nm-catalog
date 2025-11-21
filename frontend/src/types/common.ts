import type { PlaylistType } from "./enums";

interface WithLangData {
  title_de_DE: string;
  title_en_US: string;
  title_es_ES: string;
  title_fr_FR: string;
  title_it_IT: string;
  title_ja_IP: string;
  title_ko_KR: string;
  title_zh_CN: string;
  title_zh_TW: string;
  img_de_DE: string;
  img_en_US: string;
  img_es_ES: string;
  img_fr_FR: string;
  img_it_IT: string;
  img_ja_IP: string;
  img_ko_KR: string;
  img_zh_CN: string;
  img_zh_TW: string;
}

export interface Game extends WithLangData {
  id: string;
  year: number;
  hardware: string;
  link: string;
  inserted: number;
}

export interface Track extends WithLangData {
  id: string;
  gid: string;
  idx: number;
  duration: string;
  isloop: number;
  isbest: number;
}

export interface Playlist extends WithLangData {
  id: string;
  type: PlaylistType;
  tracksNum: number;
  desc?: string; //type为MULTIPLE/SPECIAL/LOOP时可能存在
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
