import { LangCode, type PlaylistType } from './enums';

export type MultiLangField<Name extends string> = {
  [key in `${Name}_${LangCode}`]: string;
};

export interface MultiLangVisualEntity extends MultiLangField<'title'>, MultiLangField<'img'> {
  id: string;
}

export interface Game extends MultiLangVisualEntity {
  year: number;
  hardware: string;
  link: string;
  inserted: number;
}

export interface Track extends MultiLangVisualEntity {
  gid?: string;
  idx: number;
  duration: string;
  isloop: number;
  isbest: number;
}

export interface Playlist
  extends MultiLangVisualEntity, MultiLangField<'desc'> {
  type: PlaylistType;
  tracksnum: number;
  isrelatedgame: number;
}

// export type NMData = Game | Track | Playlist;
export type NMData = MultiLangVisualEntity;

// export interface Lang {
//   id: string;
//   desc: string;
// }

// export interface Hardware {
//   name: string;
//   year: number;
// }

export const MAIN_TITLE = 'Nintendo Music Catalog';
