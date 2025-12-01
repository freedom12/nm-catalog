/*
  Pull data of playlists from Nintendo APIs (run [pull-game] first when update)
*/

import stmt from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import rw from '../utils/rw.js';
import tools from '../utils/tools.js';
const { request, info } = tools;

const args = process.argv.slice(2);
const specificGameIds = args.filter((x) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(x)
);
const langs = stmt.lang.select.all().map((x) => x.id);
let hasError = false;

(async () => {
  let updateds;
  try {
    updateds = JSON.parse(rw.readText('updated-playlist.json'));
  } catch (error) {
    updateds = {};
  }
  updateds.gameIds = updateds.gameIds ?? [];
  updateds.playlistIds = updateds.playlistIds ?? [];

  try {
    const sGameIds = (
      !specificGameIds.length ? JSON.parse(rw.readText('new_game.json')) : specificGameIds
    )
      .map((x) => `'${x}'`)
      .join(',');
    const sql = `select id from game where id in (${sGameIds}) and link == ''`;
    const gameIds = stmt
      .sql(sql)
      .all()
      .map((x) => x.id);
    let rawPlaylistData = [];
    let trans;

    for (const gameId of gameIds) {
      if (updateds.gameIds.includes(gameId)) {
        continue;
      }

      for (const lang of langs) {
        rawPlaylistData = await getGamePlayListInfo(gameId, lang);
        const playlistData = [
          rawPlaylistData.allPlaylist,
          rawPlaylistData.bestPlaylist,
          ...rawPlaylistData.miscPlaylistSet.officialPlaylists,
        ].map((x) => [
          x.id,
          x.type,
          1,
          x.tracksNum ?? x.tracks.length,
          x.name,
          x.thumbnailURL.split('/').reverse()[0],
          x.description || '',
        ]);

        trans = getTransactionByStatement(stmt.playlist.insert(lang));
        trans(playlistData);

        if (!langs.indexOf(lang)) {
          const playlistGameData = playlistData.map((x) => [x[0], gameId]);
          trans = getTransactionByStatement(stmt.playlist_game.insert);
          trans(playlistGameData);
        }
      }

      const playlistTrackData = [];
      for (const playlist of rawPlaylistData.miscPlaylistSet.officialPlaylists) {
        if (playlist.type !== 'LOOP' && !updateds.playlistIds.includes(playlist.id)) {
          const data = (await getPlaylistTrack(playlist.id, langs[0])).tracks.map(
            (x, i) => [playlist.id, i + 1, x.id]
          );
          stmt.playlist_track.deleteByPid.run(playlist.id);
          playlistTrackData.push(...data);
          updateds.playlistIds.push(playlist.id);
        }
      }
      updateds.gameIds.push(gameId);

      trans = getTransactionByStatement(stmt.playlist_track.insert);
      trans(playlistTrackData);
    }

    info(`Playlist data successfully pulled.`);
  } catch (err) {
    console.error(err);
    hasError = true;
  } finally {
    rw.writeText('updated-playlist.json', updateds);
    if (hasError) {
      process.exit(1);
    }
  }
})();

async function getGamePlayListInfo(gameId, lang) {
  return await request(
    `https://api.m.nintendo.com/catalog/games/${gameId}/relatedPlaylists?country=JP&lang=${lang}`
  );
}

async function getPlaylistTrack(playlistId, lang) {
  return await request(
    `https://api.m.nintendo.com/catalog/officialPlaylists/${playlistId}?country=JP&lang=${lang}`
  );
}
