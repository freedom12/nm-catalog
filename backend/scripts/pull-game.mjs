/*
  Pull data of games & tracks from Nintendo APIs
  
  -- full       # full update
  -- no-track   # only update game data
  -- (gid)      # update specific games (usually to add additional tracks)
*/

import pLimit from 'p-limit';
import stmt from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import rw from '../utils/rw.js';
import tools from '../utils/tools.js';
const { request, info, getDuration } = tools;

const args = process.argv.slice(2);
const isUpdateSpecific =
  args.filter((x) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      x
    )
  ).length > 0;
const isFullUpdate = args.includes('full');
const isNoTrack = args.includes('no-track');

const ms = Date.now();
const langs = stmt.lang.select.all().map((x) => x.id);
const existedGameIds = stmt.game.select.all().map((x) => x.id);

(async () => {
  try {
    let gameWithYears = (await getGamesByYear(langs[0])).releasedAt
      .map((x) => {
        x.items.forEach((y) => {
          y.releasedYear = x.releasedYear;
        });
        return x;
      })
      .map((x) =>
        x.items.filter((y) =>
          isFullUpdate
            ? true
            : !isUpdateSpecific
            ? !existedGameIds.includes(y.id)
            : args.includes(y.id)
        )
      )
      .filter((x) => x.length > 0);
    if (gameWithYears.length > 0) {
      gameWithYears = gameWithYears.reduce((a, b) => [...a, ...b]);
    } else {
      info(`+++++++++ No new game found. +++++++++`);
      return;
    }

    const limit = pLimit(1);
    const gamesByLang = (
      await Promise.all(
        langs.map((x) =>
          limit(async () => {
            const games = await getGamesByAdded(x);
            return {
              [x]: games
                .reverse()
                .filter((y) =>
                  isFullUpdate
                    ? true
                    : !isUpdateSpecific
                    ? !existedGameIds.includes(y.id)
                    : args.includes(y.id)
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
      ? `${gameWithYears.length} games found.`
      : !isUpdateSpecific
      ? `${games.length} new game(s) found.`
      : `${games.length} game(s) to update.`;
    info(`+++++++++ ${msg} +++++++++`);

    let playlistInfos = [];
    if (!isNoTrack) {
      playlistInfos = (
        await Promise.all(
          games.map((x) =>
            !x.isGameLink ? getGamePlaylistInfo(x.id) : Promise.resolve(undefined)
          )
        )
      ).map((x) =>
        !x
          ? {}
          : {
              allPlaylistId: x.allPlaylist.id,
              bestTrackIds: x.bestPlaylist.tracks.map((y) => y.id),
            }
      );
    }

    if (isFullUpdate) {
      stmt.game.delete.run();
    }
    if (isUpdateSpecific) {
      gamesByLang[Object.keys(gamesByLang)[0]].forEach((x) => {
        stmt.track.deleteByGid.run(x.id);
      });
    }
    for (const [lang, games] of Object.entries(gamesByLang)) {
      const gameData = games.map((x, i) => [
        x.id,
        gameWithYears.find((y) => y.id === x.id).releasedYear,
        x.formalHardware,
        x.isGameLink ? games[i + 1].id : '',
        x.name,
        x.thumbnailURL.split('/').reverse()[0],
        ms + i,
      ]);

      const trackData = [];
      if (!isNoTrack) {
        for (let i = 0; i < games.length; i++) {
          const game = games[i];
          if (!game.isGameLink) {
            const tracks = (
              await getTracksByGame(playlistInfos[i].allPlaylistId, lang)
            ).tracks.map((x, j) => [
              x.id,
              game.id,
              j + 1,
              getDuration(x.media.payloadList[0].durationMillis),
              +x.media.payloadList[0].containsLoopableMedia,
              +playlistInfos[i].bestTrackIds.includes(x.id),
              x.name,
              x.thumbnailURL.split('/').reverse()[0],
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

    const relateDataSet = new Set();
    for (const game of gameWithYears) {
      const relatedGames = await getRelateByGame(game.id);
      relatedGames.forEach((x) => {
        relateDataSet.add(`${game.id}+${x.id}`).add(`${x.id}+${game.id}`);
      });
    }
    getTransactionByStatement(stmt.game_related.insert)(
      [...relateDataSet].map((x) => x.split('+'))
    );

    info(`Game data successfully pulled.`);

    if (!isFullUpdate) {
      rw.writeText(
        rw.paths['new_game.json'],
        games.map((x) => x.id)
      );
    }
    rw.writeText(rw.paths['res_game_platform.json'], '');
    rw.writeText(rw.paths['res_game_year.json'], '');
    rw.writeText(rw.paths['updated_playlist.json'], '{}');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

async function getGamesByAdded(lang) {
  return await request(
    `https://api.m.nintendo.com/catalog/games:all?country=JP&lang=${lang}&sortRule=RECENT`
  );
}

async function getGamesByYear(lang) {
  return await request(
    `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=${lang}`
  );
}

async function getGamePlaylistInfo(gameId) {
  return await request(
    `https://api.m.nintendo.com/catalog/games/${gameId}/relatedPlaylists?country=JP&lang=zh-CN`
  );
}

async function getTracksByGame(playlistId, lang) {
  return await request(
    `https://api.m.nintendo.com/catalog/officialPlaylists/${playlistId}?country=JP&lang=${lang}`
  );
}

async function getRelateByGame(gameId) {
  return await request(
    `https://api.m.nintendo.com/catalog/games/${gameId}/relatedGames?country=JP&lang=zh-CN`
  );
}
