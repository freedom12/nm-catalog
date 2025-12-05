export const GameGroupBy = {
  PLATFORM: 'Group by Platform',
  RELEASE: 'Group by Release Year',
  ADDED: 'Sort by Latest',
} as const;
export type GameGroupBy = keyof typeof GameGroupBy;

export const GameDataSection = {
  TRACK: 'Tracks',
  PLAYLIST: 'Playlists',
  RELATED: 'Related Games',
};
export type GameDataSection = keyof typeof GameDataSection;

export const PlaylistType = {
  SINGLE_GAME_ALL: 'Single-Game: All Tracks',
  BEST: 'Single-Game: Top Tracks',
  LOOP: 'Single-Game: Extended Tracks',
  SINGLE_GAME: 'Single-Game: Theme Playlist',
  MULTIPLE: 'Multi-Game: Related Playlist',
  SPECIAL: 'Special Playlist',
};
export type PlaylistType = keyof typeof PlaylistType;

export const TrackMode = {
  ALL: 'All',
  TOP: 'Top',
  LOOP: 'Extendable',
};
export type TrackMode = keyof typeof TrackMode;

export const LangCode = {
  de_DE: 'de-DE',
  en_US: 'en-US',
  es_ES: 'es-ES',
  fr_FR: 'fr-FR',
  it_IT: 'it-IT',
  ja_JP: 'ja-JP',
  ko_KR: 'ko-KR',
  zh_CN: 'zh-CN',
  zh_TW: 'zh-TW',
} as const;
export type LangCode = keyof typeof LangCode;
export type LangCodeValue = (typeof LangCode)[keyof typeof LangCode];
