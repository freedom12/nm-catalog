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
          <h2 class="text-main" ref="titleRef">
            {{ computedTitle }} ({{ data.playlist.tracksnum }})<br />
            <small>
              {{ computedPlaylistTypeText }} · {{ getTotalDuration(data.tracks) }}
            </small>
            <small class="text-desc">{{
              stringMap.getString(data.playlist, 'desc')
            }}</small>
          </h2>
        </div>
      </section>
      <section class="detail">
        <template v-for="group in computedTrackGroup">
          <h3 v-if="group.game">
            <router-link :to="`/game/${group.game.id}`">
              <img v-fallback :src="imgMap.getPath('game', group.game)" loading="lazy" />
              {{ stringMap.getString(group.game, 'title') }}
            </router-link>
          </h3>
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
import { computed, h, onMounted, ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores';
import { useHeader } from '@/composables/useHeader';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import TrackItem from '@/components/TrackItem.vue';
import { type Game, type PlaylistDetail, type PlaylistTrack } from '@/types';
import { openSourceImg, getTotalDuration } from '@/utils/data-utils';
import { getPlaylistDetail } from '@/api';

const { t } = useI18n();
const route = useRoute();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const pid = route.params.pid as string;
const langStore = useLangStore();
const data = ref<PlaylistDetail>();
const titleRef = ref<HTMLElement>();

const computedTitle = computed(() => stringMap.getString(data.value!.playlist, 'title'));
const computedPlaylistTypeText = computed(
  () =>
    data.value &&
    t(`playlist.type.${data.value.playlist.type}`, {
      gameTitle:
        computedTrackGroup.value[0].game &&
        stringMap.getString(computedTrackGroup.value[0].game, 'title'),
    })
);
const computedTrackGroup: ComputedRef<{ game?: Game; tracks: PlaylistTrack[] }[]> =
  computed(() => {
    if (!data.value) {
      return [];
    }
    if (data.value.playlist.isrelatedgame) {
      const gameSeq =
        data.value.playlist.type !== 'MULTIPLE'
          ? [data.value.games![0].id]
          : [...new Set(data.value.tracks.map((x) => x.gid))];
      return data.value
        .games!.sort((a, b) => gameSeq.indexOf(a.id) - gameSeq.indexOf(b.id))
        .map((x) => ({
          game: x,
          tracks: data.value!.tracks.filter((y) => {
            return y.gid === x.id;
          }),
        }));
    } else {
      return [{ tracks: data.value.tracks }];
    }
  });

useHeader(() => ({
  observeRef: titleRef.value,
  data: data.value,
  template: () => {
    if (data.value) {
      return h('span', [
        computedTitle.value,
        h('small', ` (${computedPlaylistTypeText.value})`),
      ]);
    } else {
      return h('span');
    }
  },
}));

onMounted(async () => {
  await getDetail();
});

async function getDetail() {
  const result = await request(getPlaylistDetail(pid));
  imgMap
    .setData('playlist', [result.playlist])
    .setData('game', result.games ?? [])
    .setData('track', result.tracks);
  stringMap
    .setData([result.playlist, ...(result.games ?? []), ...result.tracks], 'title')
    .setData([result.playlist], 'desc');
  data.value = result;
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
