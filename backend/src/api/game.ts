import express, { type Request, type Response } from 'express';
import axios from 'axios';
import { Game, GameGroup, GameGroupBy, Playlist, Track } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { DataRow } from '../db/schema/index.js';
import { COMMON_PATHS } from '../utils/paths.js';
import { readText, toError, writeText } from '../utils/tools.js';

const router = express.Router();

interface GameRelation {
  gid: string;
  rgid: string;
}

const getGameList = (groupBy: GameGroupBy): Game[] => {
  const rows = stmt.game.selectGroupBy(groupBy).all() as Game[];
  rows.forEach((x) => {
    delete x.inserted;
  });
  return rows;
};

const getGameByYear = async (): Promise<GameGroup[]> => {
  const fileName = COMMON_PATHS['res_game_year.json'];
  const data = readText(fileName);

  if (!data) {
    let gameList: Game[];

    try {
      gameList = getGameList('RELEASE');

      const result: GameGroup[] = (
        await axios.get(
          `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=en-US`
        )
      ).data.releasedAt.map((x: DataRow) => ({
        name: x.releasedYear,
        games: (<any>x.items)
          .map((y: DataRow) => gameList.find((z) => z.id === y.id))
          .filter((y: DataRow) => !!y),
      }));

      writeText(fileName, result);
      return result;
    } catch (error) {
      const err = toError(error);
      const msg = err.message;

      try {
        const result: GameGroup[] = [];
        gameList!.forEach((x) => {
          const last = result[result.length - 1];
          if (!last || last.name !== x.year.toString()) {
            result.push({
              name: x.year.toString(),
              games: [x],
            });
          } else {
            last.games.push(x);
          }
        });
        return result;
      } catch (error) {
        const err = toError(error);
        throw {
          'Nintendo Api Error': msg,
          'Local Error': err.message,
        };
      }
    }
  } else {
    return JSON.parse(data);
  }
};

router.get('/recent', (_req: Request, res: Response) => {
  try {
    const result = getGameList('ADDED');
    res.json([
      {
        name: '',
        games: result,
      },
    ]);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', async (_req: Request, res: Response) => {
  const fileName = COMMON_PATHS['res_game_platform.json'];
  const data = readText(fileName);

  if (!data) {
    let gameList: Game[];

    try {
      gameList = getGameList('PLATFORM');

      const result: GameGroup[] = (
        await axios.get(
          `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=HARDWARE&lang=en-US`
        )
      ).data.hardware.map((x: DataRow) => ({
        name: x.formalHardware,
        games: (<any>x.items)
          .map((y: DataRow) => gameList.find((z) => z.id === y.id))
          .filter((y: DataRow) => !!y),
      }));

      writeText(fileName, result);
      res.json(result);
    } catch (error) {
      const err = toError(error);
      const msg = err.message;

      try {
        const result: GameGroup[] = [];
        gameList!.forEach((x) => {
          const last = result[result.length - 1];
          if (!last || last.name !== x.hardware) {
            result.push({
              name: x.hardware,
              games: [x],
            });
          } else {
            last.games.push(x);
          }
        });
        res.json(result);
      } catch (error) {
        const err = toError(error);
        res.status(500).json({
          'Nintendo Api Error': msg,
          'Local Error': err.message,
        });
      }
    }
  } else {
    return res.json(JSON.parse(data));
  }
});

router.get('/release', async (_req: Request, res: Response) => {
  try {
    const result = await getGameByYear();
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/detail', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const promises: [
      Promise<Game>,
      Promise<Track[]>,
      Promise<Playlist[]>,
      Promise<Game[]>
    ] = [
      new Promise((resolve, reject) => {
        try {
          const result = stmt.game.selectById().all(id)[0] as Game;
          delete result.inserted;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = (stmt.game.selectEntityById().all(id)[0] as Game).id;
          const result = stmt.track.selectByGid().all(gid) as Track[];
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = (stmt.game.selectEntityById().all(id)[0] as Game).id;
          const result = stmt.playlist.selectByGid().all(gid) as Playlist[];
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),

      new Promise(async (resolve, reject) => {
        try {
          const rgids = (stmt.game_related.selectByGid().all(id) as GameRelation[]).map(
            (x) => x.rgid
          );
          const linkIds = (stmt.game.selectLinkChainById().all(id) as Game[]).map(
            (x) => x.id
          );
          const linkRgids: string[] = [];
          if (linkIds.length > 0) {
            const validLinkIds = linkIds.filter((x) => x !== id);
            for (const linkId of validLinkIds) {
              const linkGameIds = (stmt.game.selectLinkChainById().all(linkId) as Game[])
                .map((x) => x.id)
                .filter((x) => x !== id);
              linkRgids.push(
                ...linkGameIds
                  .map((x) =>
                    (stmt.game_related.selectByGid().all(x) as GameRelation[]).map(
                      (y) => y.rgid
                    )
                  )
                  .flat()
              );
            }
          }

          const set = new Set<string>([...rgids, ...linkIds, ...linkRgids]);
          set.delete(id);
          const result = (await getGameByYear())
            .map((x) => x.games)
            .reduce((a, b) => [...a, ...b])
            .filter((x) => x.id !== id && (set.has(x.id) || set.has(x.link)));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),
    ];

    const [game, tracks, playlists, relateds] = await Promise.all(promises);
    const result = { game, tracks, playlists, relateds };
    res.json(result);
  } catch (error) {
    const err = toError(error);
    res.status(500).json({ error: err.message });
  }
});

export default router;
