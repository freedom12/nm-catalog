export const GameGroupBy = {
  PLATFORM: 'Group by Platform',
  RELEASE: 'Group by Release Year',
  ADDED: 'Sort by Latest',
} as const;
export type GameGroupBy = keyof typeof GameGroupBy;

export const GameDataSection = {
  TRACK: 'Tracks',
  RELATED: 'Related Games',
  PLAYLIST: 'Playlists',
};
export type GameDataSection = keyof typeof GameDataSection;

export const PlaylistType = {
  SINGLE_GAME_ALL: 'SINGLE_GAME_ALL',
  BEST: 'BEST',
  LOOP: 'LOOP',
  SINGLE_GAME: 'SINGLE_GAME',
  MULTIPLE: 'MULTIPLE',
  SPECIAL: 'SPECIAL',
};
export type PlaylistType = keyof typeof PlaylistType;

export const TrackMode = {
  ALL: 'All',
  TOP: 'Top',
  LOOP: 'Extendable',
};
export type TrackMode = keyof typeof TrackMode;
