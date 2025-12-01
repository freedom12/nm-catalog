import axios from 'axios';
import type { GameDetail, GameGroup } from '@/types';

export function getGames(
  groupby: 'hardware' | 'release' | 'recent'
): Promise<GameGroup[]> {
  return axios.get(`/api/game/${groupby}`);
}

export function getGameDetail(gid: string): Promise<GameDetail> {
  return axios.get(`/api/game/${gid}/detail`);
}
