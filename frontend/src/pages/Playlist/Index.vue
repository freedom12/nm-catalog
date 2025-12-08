<template>
  <Header :observeRef="titleRef">
    <template v-if="data">
      {{ computedTitle }}
      <small>({{ PlaylistType[data.playlist.type] }})</small>
    </template>
  </Header>
  <Container :loading="loading">
    <main id="main" v-if="data">
      <section class="common-detail">
        <div class="detail-image">
          <img
            :src="imgMap.getPath('playlist', data.playlist)"
            @click.stop="openSourceImg(data.playlist, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-text">
          <h2 class="text-main" ref="titleRef">
            {{ computedTitle }} ({{ data.playlist.tracksnum }})<br />
            <small
              >{{ PlaylistType[data.playlist.type] }} ·
              {{ data.playlist.tracksnum }} Tracks ·
              {{ getTotalDuration(data.tracks) }}</small
            >
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
              <img :src="imgMap.getPath('game', group.game)" loading="lazy" />
              {{ stringMap.getString(group.game, 'title') }}</router-link
            >
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
import { computed, onMounted, ref, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from '@/stores';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import { PlaylistType, type Game, type PlaylistDetail, type Track } from '@/types';
import Header from '@/components/Header.vue';
import Container from '@/components/Container.vue';
import TrackItem from '@/components/TrackItem.vue';
import { openSourceImg, getTotalDuration } from '@/utils/data-utils';
import { getPlaylistDetail } from '@/api';

defineOptions({ name: 'Playlist' });

const route = useRoute();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const pid = route.params.pid as string;
const store = useStore();
const data = ref<PlaylistDetail>();
const titleRef = ref<HTMLElement>();

const computedTitle = computed(() => stringMap.getString(data.value!.playlist, 'title'));
type PTrack = Track & { pidx?: number };
const computedTrackGroup: ComputedRef<{ game?: Game; tracks: PTrack[] }[]> = computed(
  () => {
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
            (y as PTrack).pidx = data.value!.tracks.indexOf(y) + 1;
            return y.gid === x.id;
          }),
        }));
    } else {
      return [{ tracks: data.value.tracks }];
    }
  }
);

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
