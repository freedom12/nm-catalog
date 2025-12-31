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

export const GameGroupBy = ['PLATFORM', 'RELEASE', 'ADDED'] as const;
export type GameGroupBy = (typeof GameGroupBy)[number];

export const PlaylistType = [
  'SINGLE_GAME_ALL',
  'BEST',
  'LOOP',
  'SINGLE_GAME',
  'MULTIPLE',
  'SPECIAL',
] as const;
export type PlaylistType = (typeof PlaylistType)[number];
