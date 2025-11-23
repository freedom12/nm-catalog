<template>
  <Header :observeRef="titleRef">
    <template v-if="data">
      {{ getLangTitle(data.game, store.mainLang) }}
      <small>({{ data.game.year }} | {{ data.game.hardware }})</small>
    </template>
  </Header>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <main id="main" v-if="data">
      <section class="game">
        <img
          :src="gameImgMap.get(store.mainLang)?.get(data.game.id)"
          @click.stop="openSourceImg(data.game, store.mainLang)"
          loading="lazy"
        />
        <div>
          <h2 ref="titleRef">
            {{ getLangTitle(data.game, store.mainLang) }}<br />
            <small>{{ data.game.year }} | {{ data.game.hardware }}</small>
          </h2>
          <ul>
            <li
              v-for="lang of store.langList.filter((x) => isShowTitle(data!.game, x.id))"
              :key="lang.id"
            >
              <b>{{ lang.id }}</b> {{ getLangTitle(data.game, lang.id) }}
            </li>
          </ul>
        </div>
      </section>
      <nav class="tabs">
        <div
          v-for="(value, key) in GameDataSection"
          :key="key"
          class="tab"
          :class="{ active: gameDataSection === key, blank: !(data as any)[`${key.toLocaleLowerCase()}s`]?.length }"
          @click.stop="gameDataSection = key"
        >
          {{ (data as any)[`${key.toLocaleLowerCase()}s`]?.length }} {{ value }}
        </div>
      </nav>
      <section class="detail">
        <Track
          :hidden="gameDataSection !== 'TRACK'"
          :isShowFilter="true"
          :data="data.tracks"
          :img-map="trackImgMap"
        ></Track>
        <Related
          :hidden="gameDataSection !== 'RELATED'"
          :data="data.relateds"
          :img-map="gameImgMap"
        ></Related>
        <Playlist
          :hidden="gameDataSection !== 'PLAYLIST'"
          :data="data.playlists"
          :img-map="playlistImgMap"
        ></Playlist>
      </section>
    </main>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import Header from '@/components/Header.vue';
import Track from './components/Track.vue';
import Related from './components/Related.vue';
import Playlist from './components/Playlist.vue';
import { GameDataSection, type GameDetail } from '@/types';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '@/utils/data-utils';

defineOptions({ name: 'Game' });

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const data = ref<GameDetail>();
const gameDataSection = ref<GameDataSection>('TRACK');
const gameImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const trackImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const playlistImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const loading = ref<boolean>(false);
const titleRef = ref<HTMLElement>();

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  loading.value = true;
  try {
    const res = await axios.get(`/api/game/${gid}/detail`);
    data.value = res.data;
    if (!data.value) {
      return;
    }

    for (const lang of store.langList) {
      let imgMap = new Map<string, string>();
      imgMap.set(data.value.game.id, getImgSrc(data.value.game, lang.id));
      gameImgMap.value.set(lang.id, imgMap);

      playlistImgMap.value.set(lang.id, new Map<string, string>());

      if (!trackImgMap.value.has(lang.id)) {
        imgMap = new Map<string, string>();
        for (const track of data.value.tracks) {
          imgMap.set(track.id, getImgSrc(track, lang.id));
        }
        trackImgMap.value.set(lang.id, imgMap);
      }
    }

    for (const lang of store.langList) {
      const imgMap = gameImgMap.value.get(lang.id);
      for (const game of data.value.relateds) {
        imgMap?.set(game.id, getImgSrc(game, lang.id));
      }
    }

    tempGetPlaylist();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function tempGetPlaylist() {
  if (!data.value) {
    return;
  }

  // 临时用代理接口获取播放列表数据，当前切换语言时不会刷新
  data.value.playlists = [];
  const playlistRes = await axios.get(`/api/proxy/nm/game/${gid}/playlists`, {
    params: {
      lang: store.mainLang,
    },
  });
  if (
    !playlistRes.data ||
    !playlistRes.data.miscPlaylistSet ||
    !playlistRes.data.miscPlaylistSet.officialPlaylists
  ) {
    return;
  }
  for (const playlist of playlistRes.data.miscPlaylistSet.officialPlaylists) {
    const name = playlist.name;
    const img = playlist.thumbnailURL.split('/').pop()?.split('.').shift();
    // const type = playlist.type;
    // if (type !== 'SINGLE_GAME' && type !== 'MULTIPLE') {
    //   continue;
    // }
    data.value.playlists.push({
      id: playlist.id,
      type: playlist.type,
      tracksNum: playlist.tracksNum,
      isRelatedGame: 1,
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
      img_ja_JP: img,
      img_ko_KR: img,
      img_zh_CN: img,
      img_zh_TW: img,
    });
  }

  for (const lang of store.langList) {
    const imgMap = playlistImgMap.value.get(lang.id);
    for (const playlist of data.value.playlists) {
      imgMap?.set(playlist.id, getImgSrc(playlist, lang.id));
    }
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
