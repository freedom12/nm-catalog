<template>
  <Container :loading="loading">
    <main id="main" v-if="data">
      <section class="common-detail">
        <div class="detail-image">
          <img
            v-fallback
            :src="imgMap.getPath('game', data.game)"
            @click.stop="openSourceImg(data.game, langStore.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-text">
          <h1 class="text-main" ref="titleRef">
            {{ computedTitle }}<br />
            <small>{{ data.game.year }} | {{ data.game.hardware }}</small>
          </h1>
          <ul class="text-else">
            <li v-for="lang of computedLangs" :key="lang" class="prefix-text">
              <b>{{ lang }}</b>
              {{ stringMap.getString(data.game, 'title', lang) }}
            </li>
          </ul>
        </div>
      </section>
      <nav class="tabs">
        <button
          v-for="item in computedSections"
          :key="item.key"
          class="tab"
          :class="{
            active: gameDataSection === item.key,
            blank: /^0/.test(item.label),
          }"
          @click.stop="gameDataSection = item.key"
        >
          {{ item.label }}
        </button>
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
import { computed, h, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores';
import { useHeader } from '@/composables/useHeader';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import Track from './components/Track.vue';
import Related from './components/Related.vue';
import Playlist from './components/Playlist.vue';
import { GameDataSection, type GameDetail } from '@/types';
import { getGameDetail } from '@/api';
import { isShowTitle, openSourceImg } from '@/utils/data-utils';

const { t } = useI18n();
const route = useRoute();
const langStore = useLangStore();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const gid = route.params.gid as string;
const data = ref<GameDetail>();
const gameDataSection = ref<GameDataSection>('TRACK');
const titleRef = ref<HTMLElement>();

const computedTitle = computed(() => stringMap.getString(data.value!.game, 'title'));
const computedLangs = computed(() =>
  langStore.langList.filter((x) => isShowTitle(data.value!.game, x))
);
const computedSections = computed(() => {
  const result = [];
  for (const section of GameDataSection) {
    const propName = `${section.toLowerCase()}s`;
    result.push({
      key: section,
      label: t(`game.dataSection.${section}`, {
        count: (data.value as any)[propName]?.length ?? 0,
      }),
    });
  }
  return result;
});

useHeader(() => ({
  observeRef: titleRef.value,
  data: data.value,
  template: () => {
    if (data.value) {
      return [
        h('h1', computedTitle.value),
        h('small', `(${data.value.game.year}) | ${data.value.game.hardware})`),
      ];
    } else {
      return [];
    }
  },
}));

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
