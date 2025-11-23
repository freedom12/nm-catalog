<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <main id="main" v-if="data">
      <section class="game">
        <img :src="getImgSrc(data, store.mainLang)" @click.stop="openSourceImg(data, store.mainLang)" loading="lazy" />
        <div>
          <h2 ref="titleRef">
            {{ getLangTitle(data, store.mainLang) }}<br />
            <small>{{ getPlaylistTypeDesc(data.type) }} · {{ data.tracksNum }}首 · {{ getTotalDuration() }}</small><br />
            <small>{{ data.desc }}</small>
          </h2>
        </div>
      </section>
      <section class="detail">
        <TrackComp :hidden="false" :isShowFilter="false" :data="tracks" :img-map="trackImgMap">
        </TrackComp>
      </section>
    </main>
    <div v-else>
      <p>没有找到播放列表数据</p>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import TrackComp from '../Game/components/Track.vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import { LocalizationString, PlaylistType, type Playlist, type Track } from '@/types';

import { getLangTitle, getImgSrc, openSourceImg } from '@/utils/data-utils';
import axios from 'axios';

const route = useRoute();
const pid = route.params.pid as string;
const store = useStore();
const loading = ref<boolean>(false);
const data = ref<Playlist>();
const tracks = ref<Array<Track>>([]);
const trackImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);

defineOptions({ name: 'Playlist' });

onMounted(async () => {
  await getPlaylist();
});

function getPlaylistTypeDesc(playlistType: PlaylistType): string {
  switch (playlistType) {
    case PlaylistType.BEST:
      return '精选歌单';
    case PlaylistType.LOOP:
      return '更改时长';
    case PlaylistType.MULTIPLE:
      return '系列歌单';
    case PlaylistType.SINGLE_GAME:
      return '游戏歌单';
    case PlaylistType.SINGLE_GAME_ALL:
      return '所有乐曲';
    case PlaylistType.SPECIAL:
      return '特别发布';
    default:
      return playlistType;
  }
}


function getTotalDuration(): string {
  let totalSeconds = 0;
  for (const track of tracks.value) {
    const parts = track.duration.split(':').map(part => parseInt(part, 10));
    if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}


async function getPlaylist() {
  loading.value = true;
  try {
    // 临时用代理接口获取播放列表数据，当前切换语言时不会刷新
    const res = await axios.get(`/api/proxy/nm/playlist/${pid}`, {
      params: {
        lang: store.mainLang
      }
    });

    if (!res.data) {
      return;
    }

    for (const [index, track] of res.data.tracks.entries()) {
      const name = track.name;
      const img = track.thumbnailURL.split('/').pop()?.split('.').shift();
      const durationMillis = track.media.payloadList[0].durationMillis;
      const duration = `${Math.floor(durationMillis / 60000)}:${Math.floor((durationMillis % 60000) / 1000).toString().padStart(2, '0')}`;
      tracks.value?.push({
        id: track.id,
        gid: track.game?.id,
        idx: index + 1,
        duration: duration,
        isloop: 0,
        isbest: 0,
        title_de_DE: name,
        title_en_US: name,
        title_es_ES: name,
        title_fr_FR: name,
        title_it_IT: name,
        title_ja_JP: name,
        title_ko_KR: name,
        title_zh_CN: name,
        title_zh_TW: name,
        img_de_DE: img,
        img_en_US: img,
        img_es_ES: img,
        img_fr_FR: img,
        img_it_IT: img,
        img_ja_IP: img,
        img_ko_KR: img,
        img_zh_CN: img,
        img_zh_TW: img,
      });
    }
    for (const lang of store.langList) {
      if (!trackImgMap.value.has(lang.id)) {
        let imgMap = new Map<string, string>();
        for (const track of tracks.value) {
          imgMap.set(track.id, getImgSrc(track, lang.id));
        }
        trackImgMap.value.set(lang.id, imgMap);
      }
    }

    const name = res.data.name;
    const img = res.data.thumbnailURL.split('/').pop()?.split('.').shift();
    var playlist: Playlist = {
      id: res.data.id,
      type: res.data.type,
      tracksNum: res.data.tracks.length,
      isRelatedGame: +res.data.isRelatedGame,
      title_de_DE: name,
      title_en_US: name,
      title_es_ES: name,
      title_fr_FR: name,
      title_it_IT: name,
      title_ja_JP: name,
      title_ko_KR: name,
      title_zh_CN: name,
      title_zh_TW: name,
      img_de_DE: img,
      img_en_US: img,
      img_es_ES: img,
      img_fr_FR: img,
      img_it_IT: img,
      img_ja_IP: img,
      img_ko_KR: img,
      img_zh_CN: img,
      img_zh_TW: img,
    }
    if (res.data.description) {
      playlist.desc = new LocalizationString();
      playlist.desc.set(useStore().mainLang, res.data.description);
    }

    data.value = playlist;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

</script>

<style lang="scss" scoped src="./styles.scss"></style>
