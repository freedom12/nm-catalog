/*
  Pull data of games & tracks from Nintendo APIs
  
  -- full       # full update
  -- no-track   # only update game data
  -- (gid)      # update specific games (usually to add additional tracks)
*/

import pLimit from 'p-limit';
import { LangCode, LangCodeValue } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import { DataCell, DataRow } from '../db/schema/index.js';
import { getDuration, info, isUuid, writeText } from '../utils/tools.js';
import { COMMON_PATHS } from '../utils/paths.js';
import upstreem from '../utils/upstreem.js';

const args = process.argv.slice(2);
const isUpdateSpecific = args.filter((x) => isUuid(x)).length > 0;
const isFullUpdate = args.includes('full');
const isNoTrack = args.includes('no-track');

const ms = Date.now();
const langs = Object.values(LangCode);
const existedGameIds: string[] = stmt.game
  .select()
  .all()
  .map((x) => <string>(x as DataRow).id);

(async () => {
  try {
    let flatGameWithYears: DataRow[];
    const gameWithYears: DataRow[][] = (await upstreem.getGamesByYear(langs[0]))
      .map((x: { releasedYear: number; items: DataRow[] }) => {
        x.items.forEach((y) => {
          y.releasedYear = x.releasedYear;
        });
        return x;
      })
      .map((x: { releasedYear: number; items: DataRow[] }) =>
        x.items.filter((y) =>
          isFullUpdate
            ? true
            : !isUpdateSpecific
            ? !existedGameIds.includes(<string>y.id)
            : args.includes(<string>y.id)
        )
      )
      .filter((x: DataRow[]) => x.length > 0);

    if (!gameWithYears.length) {
      info(`+++++++++ No new game found. +++++++++`);
      return;
    } else {
      flatGameWithYears = gameWithYears.reduce((a, b) => [...a, ...b]);
    }

    const limit = pLimit(1);
    const gamesByLang = (
      await Promise.all(
        langs.map((x) =>
          limit(async () => {
            const games: DataRow[] = await upstreem.getGamesByRecent(x);
            return {
              [x]: games
                .reverse()
                .filter((y) =>
                  isFullUpdate
                    ? true
                    : !isUpdateSpecific
                    ? !existedGameIds.includes(<string>y.id)
                    : args.includes(<string>y.id)
                ),
            };
          })
        )
      )
    ).reduce((a, b) => Object.assign(a, b));

    const games = gamesByLang[langs[0]];
    if (games.length === 1 && games[0].isGameLink) {
      info(`Can not update only one linked game.`);
      return;
    }

    const msg = isFullUpdate
      ? `${flatGameWithYears.length} games found.`
      : !isUpdateSpecific
      ? `${games.length} new game(s) found.`
      : `${games.length} game(s) to update.`;
    info(`+++++++++ ${msg} +++++++++`);

    let playlistInfos: { allPlaylistId?: string; bestTrackIds?: string[] }[] = [];
    if (!isNoTrack) {
      playlistInfos = (
        await Promise.all(
          games.map((x) =>
            !x.isGameLink
              ? upstreem.getPlaylistInfoOfGame(<string>x.id)
              : Promise.resolve(undefined)
          )
        )
      ).map((x) =>
        !x
          ? {}
          : {
              allPlaylistId: x.allPlaylist.id,
              bestTrackIds: x.bestPlaylist.tracks.map((y: DataRow) => y.id),
            }
      );
    }

    if (isFullUpdate) {
      stmt.game.delete().run();
    }
    if (isUpdateSpecific) {
      gamesByLang[Object.keys(gamesByLang)[0]].forEach((x) => {
        stmt.track.deleteByGid().run(x.id);
      });
    }

    for (const [lang, games] of Object.entries(gamesByLang)) {
      const gameData: DataCell[][] = games.map((x, i) => [
        x.id,
        flatGameWithYears.find((y) => y.id === x.id)!.releasedYear,
        x.formalHardware,
        x.isGameLink ? games[i + 1].id : '',
        x.name,
        (<string>x.thumbnailURL).split('/').reverse()[0],
        ms + i,
      ]);

      const trackData: DataCell[][] = [];
      if (!isNoTrack) {
        for (let i = 0; i < games.length; i++) {
          const game = games[i];
          if (!game.isGameLink) {
            const tracks: DataCell[][] = (
              await upstreem.getPlaylistInfo(
                <string>playlistInfos[i].allPlaylistId,
                <LangCodeValue>lang
              )
            ).tracks.map((x: DataRow, j: number) => [
              x.id,
              game.id,
              j + 1,
              getDuration((<any>x.media).payloadList[0].durationMillis),
              +(<any>x.media).payloadList[0].containsLoopableMedia,
              +playlistInfos[i].bestTrackIds!.includes(<string>x.id),
              x.name,
              (<string>x.thumbnailURL).split('/').reverse()[0],
            ]);
            trackData.push(...tracks);
          }
        }
      }

      let trans = getTransactionByStatement(stmt.game.insert(lang));
      trans(gameData);
      trans = getTransactionByStatement(stmt.track.insert(lang));
      trans(trackData);
    }

    const relateDataSet = new Set<string>();
    for (const game of flatGameWithYears) {
      const relatedGames: DataRow[] = await upstreem.getRelatedsOfGame(<string>game.id);
      relatedGames.forEach((x) => {
        relateDataSet.add(`${game.id}+${x.id}`).add(`${x.id}+${game.id}`);
      });
    }
    getTransactionByStatement(stmt.game_related.insert())(
      [...relateDataSet].map((x) => x.split('+'))
    );

    info(`Game data successfully pulled.`);

    if (!isFullUpdate) {
      writeText(
        COMMON_PATHS['new_game.json'],
        games.map((x) => x.id)
      );
    }
    writeText(COMMON_PATHS['res_game_platform.json'], '');
    writeText(COMMON_PATHS['res_game_year.json'], '');
    writeText(COMMON_PATHS['updated_playlist.json'], '{}');
  } catch (errof) {
    console.error(errof);
    process.exit(1);
  }
})();
