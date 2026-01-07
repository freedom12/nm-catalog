export { DEFAULT_LANG, LangCode } from '@nm-catalog/shared';
export type { MultiLangField, Game, Track, Playlist, NMData } from '@nm-catalog/shared';

export const MAIN_TITLE = 'Nintendo Music Catalog';
export const STORAGE_KEY = {
  FIRST: 'FIRST',
  LOCALE: 'LOCALE',
  LANG: 'LANG',
  GAME_GROUPBY: 'GAME_GROUPBY',
};

export interface DurationInfo {
  hour: number;
  minute: number;
  second: number;
}
