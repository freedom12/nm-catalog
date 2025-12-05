import axios from 'axios';
import type { GameDetail, GameGroup, PlaylistDetail } from '@/types';

const call = async (promise: Promise<{ data: any }>): Promise<any> => {
  const result = await promise;
  return result.data;
};

export const getGames = (
  groupby: 'hardware' | 'release' | 'recent'
): Promise<GameGroup[]> => {
  return call(axios.get(`/api/game/${groupby}`));
};

export const getGameDetail = (gid: string): Promise<GameDetail> => {
  return call(axios.get(`/api/game/${gid}/detail`));
};

export const getPlaylistDetail = (pid: string): Promise<PlaylistDetail> => {
  return call(axios.get(`/api/playlist/${pid}/detail`));
};
