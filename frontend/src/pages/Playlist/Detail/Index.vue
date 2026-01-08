<template>
  <Container :loading="loading">
    <main id="main" v-if="data">
      <section class="common-detail">
        <div class="detail-image">
          <img
            v-fallback
            :src="imgMap.getPath('playlist', data.playlist)"
            @click.stop="openSourceImg(data.playlist, langStore.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-text">
          <h1 class="text-main" ref="titleRef">
            {{ computedTitle }}<br />
            <small> {{ computedPlaylistTypeText }}</small>
            <small class="text-desc">
              {{ t('playlist.trackCount', { count: computedTrackCount }) }} ·
              <template v-if="data.duration.hour"
                >{{ data.duration.hour }}{{ t('common.hour') }}</template
              >
              {{ data.duration.minute }}{{ t('common.minute') }}
            </small>
            <small class="text-desc">{{
              stringMap.getString(data.playlist, 'desc')
            }}</small>
          </h1>
        </div>
      </section>
      <section class="detail">
        <template v-for="group in data.trackGroups">
          <h2 v-if="group.game">
            <router-link :to="`/game/${group.game.id}`">
              <img v-fallback :src="imgMap.getPath('game', group.game)" loading="lazy" />
              {{ stringMap.getString(group.game, 'title') }}
            </router-link>
          </h2>
          <TrackItem
            v-for="(track, index) in group.tracks"
            :key="track.id"
            :data="track"
            :idx="track.pidx ?? index"
            :hideTag="true"
          ></TrackItem>
        </template>
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
import TrackItem from '@/components/TrackItem.vue';
import { type DurationInfo, type PlaylistDetail } from '@/types';
import { openSourceImg, getTotalDuration } from '@/utils/data-utils';
import { getPlaylistDetail } from '@/api';

const { t } = useI18n();
const route = useRoute();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const pid = route.params.pid as string;
const langStore = useLangStore();
const data = ref<PlaylistDetail & { duration: DurationInfo }>();
const titleRef = ref<HTMLElement>();

const computedTitle = computed(() => stringMap.getString(data.value!.playlist, 'title'));
const computedPlaylistTypeText = computed(
  () =>
    data.value &&
    t(`playlist.type.${data.value.playlist.type}`, {
      gameTitle:
        data.value.trackGroups[0].game &&
        stringMap.getString(data.value.trackGroups[0].game, 'title'),
    })
);
const computedTrackCount = computed(() => {
  return (
    data.value?.playlist.tracksnum ||
    data.value?.trackGroups.map((x) => x.tracks.length).reduce((a, b) => a + b)
  );
});

useHeader(() => ({
  observeRef: titleRef.value,
  data: data.value,
  template: () => {
    if (data.value) {
      return [
        h('h1', computedTitle.value),
        h('small', ` (${computedPlaylistTypeText.value})`),
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
  const result = await request(getPlaylistDetail(pid));
  const games = result.trackGroups.filter((x) => x.game).map((x) => x.game!);
  const tracks = result.trackGroups.map((x) => x.tracks).flat(1);
  imgMap
    .setData('playlist', [result.playlist])
    .setData('game', games)
    .setData('track', tracks);
  stringMap
    .setData([result.playlist, ...games, ...tracks], 'title')
    .setData([result.playlist], 'desc');
  data.value = Object.assign(result, { duration: getTotalDuration(tracks) });
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
