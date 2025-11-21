<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <main id="main" v-if="data">
      <section class="game">
        <img :src="getImgSrc(data, store.mainLang)"
          @click.stop="openSourceImg(data, store.mainLang)" loading="lazy" />
        <div>
          <h2 ref="titleRef">
            {{ getLangTitle(data, store.mainLang) }}<br />
            <small>{{ data.type }} | {{ data.tracksNum }}</small>
          </h2>
        </div>
      </section>
      <section class="detail">
        <TrackComp :hidden="false" :data="tracks" :img-map="trackImgMap">
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
import type { Playlist, Track } from '@/types';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '@/utils/data-utils';
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

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
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
      tracks.value?.push({
        id: track.id,
        gid: track.game.id,
        idx: index+1,
        duration: "0:00",
        isloop: 0,
        isbest: 0,
        title_de_DE: name,
        title_en_US: name,
        title_es_ES: name,
        title_fr_FR: name,
        title_it_IT: name,
        title_ja_IP: name,
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
    const img = "7bd01ff9-6710-4372-96d6-5d5f1b6a569e"; //res.data.thumbnailURL.split('/').pop()?.split('.').shift();
    var playlist = {
      id: res.data.id,
      type: res.data.type,
      tracksNum: res.data.tracks.length,
      isRelatedGame: +res.data.isRelatedGame,
      title_de_DE: name,
      title_en_US: name,
      title_es_ES: name,
      title_fr_FR: name,
      title_it_IT: name,
      title_ja_IP: name,
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

    data.value = playlist;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

</script>

<style lang="scss" scoped src="./styles.scss"></style>
