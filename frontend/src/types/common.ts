import { LangCode, type PlaylistType } from './enums';

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

export interface Playlist
  extends MultiLangField<'title'>,
    MultiLangField<'img'>,
    MultiLangField<'desc'> {
  id: string;
  type: PlaylistType;
  tracksnum: number;
  isrelatedgame: number;
}

export type NMData = Game | Track | Playlist;

// export interface Lang {
//   id: string;
//   desc: string;
// }

// export interface Hardware {
//   name: string;
//   year: number;
// }

export const MAIN_TITLE = 'Nintendo Music Catalog';
