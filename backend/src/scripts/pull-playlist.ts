/*
  Pull data of playlists from Nintendo APIs (run [pull-game] first when update)
  
  -- (gid)         # update playlists of specific games
  -- section       # from playlist_section.json
  -- (pid)         # update playlists from playlist_section.json (used with "-- section")
*/

import { LangCode, Playlist, PlaylistType } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { getTransactionByStatement } from '../db/transaction.js';
import { COMMON_PATHS } from '../utils/paths.js';
import { getDuration, info, isUuid, readText, writeText } from '../utils/tools.js';
import { DataCell, DataRow } from '../db/schema/index.js';
import upstreem from '../utils/upstreem.js';

const args = process.argv.slice(2);
const specificIds = args.filter((x) => isUuid(x));
const isFromSection = args.includes('section');
const langs = Object.values(LangCode);
let hasError = false;

(async () => {
  let updateds: {
    gameIds?: string[];
    playlistIds?: string[];
    sectionPlaylistIds?: string[];
  };
  try {
    updateds = JSON.parse(readText(COMMON_PATHS['updated_playlist.json']));
  } catch (error) {
    updateds = {};
  }
  updateds.gameIds = updateds.gameIds ?? [];
  updateds.playlistIds = updateds.playlistIds ?? [];
  updateds.sectionPlaylistIds = updateds.sectionPlaylistIds ?? [];

  try {
    let trans;

    if (!isFromSection) {
      const sGameIds: string[] = !specificIds.length
        ? JSON.parse(readText(COMMON_PATHS['new_game.json']))
        : specificIds;
      const gameIds = stmt.game
        .selectByIds(sGameIds, true)
        .all()
        .map((x) => (x as DataRow).id);
      let rawPlaylistData;

      for (const gameId of gameIds) {
        if (updateds.gameIds.includes(<string>gameId)) {
          continue;
        }

        const playlistGameData: DataCell[][] = [];
        const playlistTrackData: DataCell[][] = [];

        for (const lang of langs) {
          rawPlaylistData = await upstreem.getPlaylistInfoOfGame(<string>gameId, lang);
          const playlistData: DataCell[][] = [
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
            playlistGameData.push(...playlistData.map((x) => [x[0], gameId]));
          }
        }

        for (const playlist of rawPlaylistData.miscPlaylistSet.officialPlaylists) {
          if (
            playlist.type !== <PlaylistType>'LOOP' &&
            !updateds.playlistIds.includes(playlist.id)
          ) {
            const rawData = await upstreem.getPlaylistInfo(playlist.id, langs[0]);
            const data: DataCell[][] = rawData.tracks.map((x: DataRow, i: number) => [
              playlist.id,
              i + 1,
              x.id,
            ]);
            stmt.playlist_track.deleteByPid().run(playlist.id);
            playlistTrackData.push(...data);

            if (playlist.type === <PlaylistType>'MULTIPLE') {
              playlistGameData.push(
                ...[...new Set<string>(rawData.tracks.map((x: any) => x.game.id))].map(
                  (x) => [playlist.id, x]
                )
              );
            }
          }
          updateds.playlistIds.push(playlist.id);
        }
        updateds.playlistIds.push(
          rawPlaylistData.allPlaylist.id,
          rawPlaylistData.bestPlaylist.id
        );
        updateds.gameIds.push(<string>gameId);

        trans = getTransactionByStatement(stmt.playlist_game.insert());
        trans(playlistGameData);
        trans = getTransactionByStatement(stmt.playlist_track.insert());
        trans(playlistTrackData);
      }
    } else {
      const sections = JSON.parse(readText(COMMON_PATHS['res_playlist_section.json']));
      let playlists = (<DataRow[][]>Object.values(sections)).reduce((a, b) => [
        ...a,
        ...b,
      ]);
      if (specificIds.length) {
        playlists = playlists.filter((x) => specificIds.includes(<string>x.id));
      } else {
        const existedPlaylists = stmt.playlist
          .selectByIds(playlists.map((x) => x.id))
          .all() as Playlist[];
        playlists = playlists.filter((x) => {
          const item = existedPlaylists.find((y) => y.id === x.id);
          return !item || !item.tracksnum;
        });
      }

      for (const playlist of playlists) {
        if (updateds.sectionPlaylistIds.includes(<string>playlist.id)) {
          continue;
        }

        const isSpecial = playlist.type === <PlaylistType>'SPECIAL',
          isAnnual = /20\d{2}/.test(<string>playlist.name);
        const isRegularlyUpdate = !isSpecial && !isAnnual;

        for (const lang of langs) {
          const playlistData: DataCell[][] = [];
          const trackData: DataCell[][] = [];
          const playlistTrackData: DataCell[][] = [];

          const rawData: DataRow = await upstreem.getPlaylistInfo(
            <string>playlist.id,
            lang
          );
          playlistData.push([
            rawData.id,
            rawData.type,
            0,
            isRegularlyUpdate ? 0 : (<any>rawData.tracks).length,
            rawData.name,
            (<string>rawData.thumbnailURL).split('/').reverse()[0],
            rawData.description || '',
          ]);

          trans = getTransactionByStatement(stmt.playlist.insert(lang));
          trans(playlistData);

          if (isSpecial) {
            trackData.push(
              ...(<any>rawData.tracks).map((x: DataRow) => [
                x.id,
                '',
                0,
                getDuration((<any>x.media).payloadList[0].durationMillis),
                0,
                0,
                x.name,
                (<string>rawData.thumbnailURL).split('/').reverse()[0],
              ])
            );

            trans = getTransactionByStatement(stmt.track.insert(lang));
            trans(trackData);
          }

          if (!langs.indexOf(lang)) {
            playlistTrackData.push(
              ...(<any>rawData.tracks).map((x: DataRow, i: number) => [
                playlist.id,
                isRegularlyUpdate ? 0 : i + 1,
                x.id,
              ])
            );

            stmt.playlist_track.deleteByPid().run(playlist.id);
            trans = getTransactionByStatement(stmt.playlist_track.insert());
            trans(playlistTrackData);
          }
        }

        writeText(COMMON_PATHS['new_game.json'], '[]');
        updateds.gameIds = [];
        updateds.playlistIds = [];
        updateds.sectionPlaylistIds.push(<string>playlist.id);
      }
    }

    info(`Playlist data successfully pulled.`);
  } catch (error) {
    console.error(error);
    hasError = true;
  } finally {
    writeText(COMMON_PATHS['updated_playlist.json'], updateds);
    if (hasError) {
      process.exit(1);
    }
  }
})();
