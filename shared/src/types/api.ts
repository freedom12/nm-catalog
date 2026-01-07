import type { Game, Playlist, Track } from './common.js';

export interface GameGroup {
  name: string;
  games: Game[];
}

export interface GameDetail {
  game: Game;
  tracks: Track[];
  playlists: Playlist[];
  relateds: Game[];
}

export interface PlaylistTrack extends Track {
  pidx: number;
  game?: Game;
}

export interface PlaylistTrackGroup {
  game?: Game;
  tracks: PlaylistTrack[];
}

export interface PlaylistDetail {
  playlist: Playlist;
  trackGroups: PlaylistTrackGroup[];
}
