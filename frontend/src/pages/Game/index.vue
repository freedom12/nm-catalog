<template>
  <Header :observeRef="titleRef">
    <template v-if="data">
      {{ getLangTitle(data.game, store.mainLang) }}
      <small>({{ data.game.year }} | {{ data.game.hardware }})</small>
    </template>
  </Header>
  <Container :loading="loading">
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
              class="prefix-text"
            >
              <b>{{ lang.id }}</b>
              {{ getLangTitle(data.game, lang.id) }}
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
  </Container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import { useRequest } from '@/composables/useRequest';
import Header from '@/components/Header.vue';
import Container from '@/components/Container.vue';
import Track from './components/Track.vue';
import Related from './components/Related.vue';
import Playlist from './components/Playlist.vue';
import { GameDataSection, type GameDetail } from '@/types';
import { getGameDetail } from '@/api';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '@/utils/data-utils';

defineOptions({ name: 'Game' });

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const { loading, request } = useRequest();
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
const titleRef = ref<HTMLElement>();

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  data.value = await request(getGameDetail(gid));
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

  for (const lang of store.langList) {
    const imgMap = playlistImgMap.value.get(lang.id);
    for (const playlist of data.value.playlists) {
      imgMap?.set(playlist.id, getImgSrc(playlist, lang.id));
    }
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
