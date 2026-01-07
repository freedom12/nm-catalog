import express, { type Request, type Response } from 'express';
import {
  Game,
  Playlist,
  PlaylistDetail,
  PlaylistTrack,
  PlaylistTrackGroup,
} from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { toError } from '../utils/tools.js';

const router = express.Router();

router.get('/:id/detail', (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById().all(id)[0] as Playlist;
    const tracks: PlaylistTrack[] = [];
    const trackGroups: PlaylistTrackGroup[] = [];

    if (['SINGLE_GAME_ALL', 'BEST', 'LOOP'].includes(playlist.type)) {
      const game = <Game>stmt.playlist_game.selectGameByPid().all(id)[0];
      const allTracks = stmt.track.selectByGid().all(game.id) as PlaylistTrack[];
      tracks.push(
        ...allTracks.filter((x) => {
          switch (playlist.type) {
            case 'SINGLE_GAME_ALL':
              return true;
            case 'BEST':
              return x.isbest;
            case 'LOOP':
              return x.isloop;
          }
        })
      );
      trackGroups.push({ game, tracks });
    } else {
      if (playlist.tracksnum) {
        const ptIds = (
          stmt.playlist_track.selectTrackByPid().all(id) as PlaylistTrack[]
        ).map((x) => x.id);
        const pTracks = (stmt.track.selectByIds(ptIds).all() as PlaylistTrack[]).sort(
          (a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id)
        );
        tracks.push(...pTracks);

        if (playlist.isrelatedgame) {
          const games = stmt.playlist_game.selectGameByPid().all(id) as Game[];
          tracks.forEach((x, i) => {
            if (i === 0 || x.gid !== tracks[i - 1].gid) {
              trackGroups.push({
                game: games.find((y) => y.id === x.gid),
                tracks: [],
              });
            }
            const group = trackGroups.at(-1);
            group!.tracks.push(x);
          });
        } else {
          trackGroups.push({ tracks });
        }
      } else {
        // const sUtc9 = now.toLocaleString('en-US', {
        //   timeZone: 'Asia/Tokyo',
        // });
        // # daily order (response/playlist_(pid).json)

        trackGroups.push({ tracks: [] });
      }
    }

    tracks.forEach((x, i) => {
      x.pidx = i + 1;
    });

    const result: PlaylistDetail = { playlist, trackGroups };
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
