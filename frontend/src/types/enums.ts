export { GameGroupBy, LangCode, PlaylistType } from '@nm-catalog/shared';
export type { LangCodeValue } from '@nm-catalog/shared';

export const GameDataSection = ['TRACK', 'PLAYLIST', 'RELATED'] as const;
export type GameDataSection = (typeof GameDataSection)[number];

export const TrackTag = ['ALL', 'TOP', 'LOOP'] as const;
export type TrackTag = (typeof TrackTag)[number];
