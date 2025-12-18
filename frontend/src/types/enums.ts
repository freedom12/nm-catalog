export { GameGroupBy, LangCode, PlaylistType } from '@nm-catalog/shared';
export type { LangCodeValue } from '@nm-catalog/shared';

export const GameDataSection = {
  TRACK: 'Tracks',
  PLAYLIST: 'Playlists',
  RELATED: 'Related Games',
};
export type GameDataSection = keyof typeof GameDataSection;

export const TrackMode = {
  ALL: 'All',
  TOP: 'Top',
  LOOP: 'Extendable',
};
export type TrackMode = keyof typeof TrackMode;
