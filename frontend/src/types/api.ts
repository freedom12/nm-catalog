import type { Game, Playlist, Track } from './common';

export interface GameGroup {
  name: string;
  games: Game[];
}

export interface GameDetail {
  game: Game;
  tracks: Track[];
  relateds: Game[];
  playlists: Playlist[];
}
