<template>
  <Header :observeRef="titleRef">
    <template v-if="data">
      {{ computedTitle }}
      <small>({{ data.game.year }} | {{ data.game.hardware }})</small>
    </template>
  </Header>
  <Container :loading="loading">
    <main id="main" v-if="data">
      <section class="common-detail">
        <div class="detail-image">
          <img
            :src="imgMap.getPath('game', data.game)"
            @click.stop="openSourceImg(data.game, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-text">
          <h2 class="text-main" ref="titleRef">
            {{ computedTitle }}<br />
            <small>{{ data.game.year }} | {{ data.game.hardware }}</small>
          </h2>
          <ul class="text-else">
            <li v-for="lang of computedLangs" :key="lang" class="prefix-text">
              <b>{{ lang }}</b>
              {{ stringMap.getString(data.game, 'title', lang) }}
            </li>
          </ul>
        </div>
      </section>
      <nav class="tabs">
        <div
          v-for="item in computedSections"
          :key="item.key"
          class="tab"
          :class="{ active: gameDataSection === item.key, blank: !item.len }"
          @click.stop="gameDataSection = item.key"
        >
          {{ item.len }} {{ item.label }}
        </div>
      </nav>
      <section class="detail">
        <Track
          :hidden="gameDataSection !== 'TRACK'"
          :isShowFilter="true"
          :data="data.tracks"
        ></Track>
        <Related :hidden="gameDataSection !== 'RELATED'" :data="data.relateds"></Related>
        <Playlist
          :hidden="gameDataSection !== 'PLAYLIST'"
          :data="data.playlists"
        ></Playlist>
      </section>
    </main>
  </Container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Header from '@/components/Header.vue';
import Container from '@/components/Container.vue';
import Track from './components/Track.vue';
import Related from './components/Related.vue';
import Playlist from './components/Playlist.vue';
import { GameDataSection, type GameDetail } from '@/types';
import { getGameDetail } from '@/api';
import { isShowTitle, openSourceImg } from '@/utils/data-utils';

defineOptions({ name: 'Game' });

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const data = ref<GameDetail>();
const gameDataSection = ref<GameDataSection>('TRACK');
const titleRef = ref<HTMLElement>();

const computedTitle = computed(() => stringMap.getString(data.value!.game, 'title'));
const computedLangs = computed(() =>
  store.langList.filter((x) => isShowTitle(data.value!.game, x))
);
const computedSections = computed(() => {
  const result = [];
  for (const [key, value] of Object.entries(GameDataSection)) {
    const propName = `${key.toLowerCase()}s`;
    result.push({
      key: key as GameDataSection,
      label: value,
      len: (data.value as any)[propName]?.length ?? 0,
    });
  }
  return result;
});

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  const result = await request(getGameDetail(gid));
  imgMap
    .setData('game', [result.game, ...result.relateds])
    .setData('track', result.tracks)
    .setData('playlist', result.playlists);
  stringMap
    .setData(
      [result.game, ...result.relateds, ...result.tracks, ...result.playlists],
      'title'
    )
    .setData(result.playlists, 'desc');
  data.value = result;
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
