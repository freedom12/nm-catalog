<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <main id="main" v-if="data">
      <section class="game">
        <img :src="getImgSrc(data.playlist, store.mainLang)" @click.stop="openSourceImg(data.playlist, store.mainLang)" loading="lazy" />
        <div>
          <h2 ref="titleRef">
            {{ getLangTitle(data.playlist, store.mainLang) }}<br />
            <small>{{ getPlaylistTypeDesc(data.playlist.type) }} · {{ data.tracks.length }}首 · {{ getTotalDuration(data.tracks) }}</small><br />
            <small>{{ getLangDesc(data.playlist, store.mainLang) }}</small>
          </h2>
        </div>
      </section>
      <section class="detail">
        <TrackComp :hidden="false" :isShowFilter="false" :data="data.tracks" :img-map="trackImgMap">
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
import { useRequest } from '@/composables/useRequest';
import { PlaylistType, type PlaylistDetail } from '@/types';

import { getLangTitle, getImgSrc, openSourceImg, getLangDesc, getTotalDuration } from '@/utils/data-utils';
import { getPlaylistDetail } from '@/api';

const route = useRoute();
const { loading, request } = useRequest();
const pid = route.params.pid as string;
const store = useStore();
const data = ref<PlaylistDetail>();
const trackImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);

defineOptions({ name: 'Playlist' });

onMounted(async () => {
  await getDetail();
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

async function getDetail() {
  data.value = await request(getPlaylistDetail(pid));
  if (!data.value) {
    return;
  }

  for (const lang of store.langList) {
    if (!trackImgMap.value.has(lang.id)) {
      let imgMap = new Map<string, string>();
      for (const track of data.value.tracks) {
        imgMap.set(track.id, getImgSrc(track, lang.id));
      }
      trackImgMap.value.set(lang.id, imgMap);
    }
  }
}

</script>

<style lang="scss" scoped src="./styles.scss"></style>
