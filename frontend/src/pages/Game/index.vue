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

defineOptions({ name: 'Detail' });

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
    data.value.playlists = []; // Dummy data for playlists
    for (let j = 0; j < 10; j++) {
      data.value.playlists.push({
        id: 'e55a92d6-12f2-4011-8312-e7b38e2a3c7f',
        type: 'SINGLE_GAME',
        tracksNum: 10,
        title_de_DE: "",
        title_en_US: "",
        title_es_ES: "",
        title_fr_FR: "",
        title_it_IT: "",
        title_ja_IP: "",
        title_ko_KR: "",
        title_zh_CN: "世界",
        title_zh_TW: "",
        img_de_DE: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_en_US: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_es_ES: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_fr_FR: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_it_IT: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_ja_IP: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_ko_KR: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_zh_CN: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_zh_TW: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
      });
    }
    for (let j = 0; j < 10; j++) {
      data.value.playlists.push({
        id: 'e55a92d6-12f2-4011-8312-e7b38e2a3c7f',
        type: 'MULTIPLE',
        tracksNum: 10,
        title_de_DE: "",
        title_en_US: "",
        title_es_ES: "",
        title_fr_FR: "",
        title_it_IT: "",
        title_ja_IP: "",
        title_ko_KR: "",
        title_zh_CN: "世界",
        title_zh_TW: "",
        img_de_DE: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_en_US: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_es_ES: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_fr_FR: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_it_IT: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_ja_IP: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_ko_KR: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_zh_CN: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
        img_zh_TW: "7bd01ff9-6710-4372-96d6-5d5f1b6a569e",
      });
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

    for (const lang of store.langList) {
      const imgMap = playlistImgMap.value.get(lang.id);
      for (const playlist of data.value.playlists) {
        imgMap?.set(playlist.id, getImgSrc(playlist, lang.id));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
