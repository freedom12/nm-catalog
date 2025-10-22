/*
  Pull data from Nintendo APIs
  
  -- full       # full update
  -- only-game  # only update games (no tracks)
*/

import axios from 'axios';
import pLimit from 'p-limit';
import stmt from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import rw from '../utils/rw.js';

const args = process.argv.slice(2);
const isUpdateSpecific =
  args.filter((x) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      x
    )
  ).length > 0;
const isFullUpdate = args.includes('full');
const isOnlyGame = args.includes('only-game');

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
      console.log('\x1b[32m%s\x1b[0m', `+++++++++ No new game found. +++++++++`);
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
                  !isUpdateSpecific ? !existedGameIds.includes(y.id) : args.includes(y.id)
                ),
            };
          })
        )
      )
    ).reduce((a, b) => Object.assign(a, b));

    const msg = isFullUpdate
      ? `${gameWithYears.length} games found.`
      : !isUpdateSpecific
      ? `${gamesByLang[langs[0]].length} new game(s) found.`
      : `${gamesByLang[langs[0]].length} game(s) to update.`;
    console.log('\x1b[32m%s\x1b[0m', `+++++++++ ${msg} +++++++++`);

    let playlistInfos = [];
    if (!isOnlyGame) {
      playlistInfos = (
        await Promise.all(gamesByLang[langs[0]].map((x) => getGamePlayListInfo(x.id)))
      ).map((x) => ({
        allPlaylistId: x.allPlaylist.id,
        bestTrackIds: x.bestPlaylist.tracks.map((y) => y.id),
      }));
    }

    if (isFullUpdate) {
      stmt.game.delete.run();
    }
    if (isUpdateSpecific) {
      gamesByLang[Object.keys(gamesByLang)[0]].forEach((x) => {
        stmt.game.deleteByGid.run(x.id);
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
      if (!isOnlyGame) {
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
    getTransactionByStatement(stmt.relate.insert)(
      [...relateDataSet].map((x) => x.split('+'))
    );

    console.log('Data successfully pulled.');

    rw.writeText(
      'new_game.json',
      gamesByLang[langs[0]].map((x) => x.id)
    );
    rw.writeText('res-platform.json', '');
    rw.writeText('res-year.json', '');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

async function getGamesByAdded(lang) {
  const res = await axios.get(
    `https://api.m.nintendo.com/catalog/games:all?country=JP&lang=${lang}&sortRule=RECENT`
  );
  return res.data;
}

async function getGamesByYear(lang) {
  const res = await axios.get(
    `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=${lang}`
  );
  return res.data;
}

async function getGamePlayListInfo(gameId) {
  const res = await axios.get(
    `https://api.m.nintendo.com/catalog/games/${gameId}/relatedPlaylists?country=JP&lang=zh-CN&membership=BASIC&packageType=hls_cbcs&sdkVersion=ios-1.4.0_f362763-1`
  );
  return res.data;
}

async function getTracksByGame(playlistId, lang) {
  const res = await axios.get(
    `https://api.m.nintendo.com/catalog/officialPlaylists/${playlistId}?country=JP&lang=${lang}&membership=BASIC&packageType=hls_cbcs&sdkVersion=ios-1.4.0_f362763-1`
  );
  return res.data;
}

async function getRelateByGame(gameId) {
  const res = await axios.get(
    `https://api.m.nintendo.com/catalog/games/${gameId}/relatedGames?country=JP&lang=zh-CN`
  );
  return res.data;
}

function getDuration(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
}
