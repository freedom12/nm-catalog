import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { DEFAULT_LANG, LangCodeValue } from '@nm-catalog/shared';

export const UPSTREAM_API_BASE_URL = 'https://api.m.nintendo.com/catalog/';
export const UPSTREAM_IMG_BASE_URL = 'https://image-assets.m.nintendo.com/';

interface RetryConfig extends InternalAxiosRequestConfig {
  retry: number;
}

const httpClient = axios.create({
  timeout: 10000,
});
httpClient.interceptors.request.use((config) => {
  const retryConfig = config as RetryConfig;
  if (!retryConfig.retry) {
    console.log(`Fetching: ${config.url}`);
  }
  return config;
});
httpClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const config = error.config as RetryConfig;
    if (!config) {
      return Promise.reject(error);
    }
    config.retry ??= 0;
    if (config.retry >= 3) {
      console.error('\x1b[31m%s\x1b[0m', `Failed after retries: ${config.url}`);
      return Promise.reject(error);
    }
    config.retry += 1;
    if (!error.response || error.response.status >= 500) {
      console.log(`Retry fetching (${config.retry}): ${config.url}`);
      await new Promise((resolve) => setTimeout(resolve, 500 * config.retry));
      return httpClient(config);
    }
    return Promise.reject(error);
  }
);

const request = async (url: string): Promise<any> => {
  const res = await httpClient.get(url);
  return res.data;
};

const upstreem = {
  async getGamesByRecent(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games:all?country=JP&lang=${lang}&sortRule=RECENT`
    );
  },
  async getGamesByYear(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return (
      await request(
        `${UPSTREAM_API_BASE_URL}gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=${lang}`
      )
    ).releasedAt;
  },
  async getGamesByHardware(lang: LangCodeValue = DEFAULT_LANG): Promise<any> {
    return (
      await request(
        `${UPSTREAM_API_BASE_URL}gameGroups?country=JP&groupingPolicy=HARDWARE&lang=${lang}`
      )
    ).hardware;
  },
  async getPlaylistInfoOfGame(
    gameId: string,
    lang: LangCodeValue = DEFAULT_LANG
  ): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games/${gameId}/relatedPlaylists?country=JP&lang=${lang}`
    );
  },
  async getRelatedsOfGame(gameId: string): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}games/${gameId}/relatedGames?country=JP&lang=zh-CN`
    );
  },
  async getPlaylistInfo(
    playlistId: string,
    lang: LangCodeValue = DEFAULT_LANG
  ): Promise<any> {
    return await request(
      `${UPSTREAM_API_BASE_URL}officialPlaylists/${playlistId}?country=JP&lang=${lang}`
    );
  },
};

export default upstreem;
