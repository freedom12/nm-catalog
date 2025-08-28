<template>
  <div class="loading" v-if="loading"></div>
  <div class="container" v-else>
    <div class="game" v-if="game">
      <img
        :src="gameImgMap.get(store.mainLang)?.get(game.id)"
        @click.stop="openSourceImg(game, store.mainLang)"
        loading="lazy"
      />
      <div>
        <h2>
          {{ getLangTitle(game, store.mainLang) }}<br />
          <small>{{ game?.year }} | {{ game?.hardware }}</small>
        </h2>
        <p
          v-for="lang of store.langList.filter((x) => isShowTitle(game, x.id))"
          :key="lang.id"
        >
          <b>{{ lang.id }}</b> {{ getLangTitle(game, lang.id) }}
        </p>
      </div>
    </div>
    <div class="tabs">
      <div class="tab" :class="{ active: showTrack }" @click.stop="showTrack = true">
        {{ trackList.length }} Tracks
      </div>
      <div
        class="tab"
        :class="{ active: !showTrack, blank: !relateList.length }"
        @click.stop="showTrack = false"
      >
        {{ relateList.length }} Related Games
      </div>
    </div>
    <div class="track" :hidden="!showTrack">
      <div v-for="track in trackList" :key="track.idx">
        <div>
          <img
            :src="trackImgMap?.get(store.mainLang)?.get(track.id)"
            @click.stop="openSourceImg(track, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div>
          <h4>
            {{ track.idx }}. {{ getLangTitle(track, store.mainLang) }}
            <small>({{ track.duration }})</small>
          </h4>
          <p
            v-for="lang of store.langList.filter((x) => isShowTitle(track, x.id))"
            :key="lang.id"
          >
            <b>{{ lang.id }}</b> {{ getLangTitle(track, lang.id) }}
          </p>
        </div>
      </div>
    </div>
    <div class="track" :hidden="showTrack">
      <div v-for="relate in relateList" :key="relate.id">
        <div>
          <img
            :src="gameImgMap?.get(store.mainLang)?.get(relate.id)"
            @click.stop="openSourceImg(relate, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div>
          <h4>
            <router-link :to="`/${relate.id}`">
              {{ getLangTitle(relate, store.mainLang) }}</router-link
            >
            <small class="xs-visible">({{ relate.year }} | {{ relate.hardware }})</small>
          </h4>
          <p>{{ relate.year }} | {{ relate.hardware }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useStore } from '../stores';
import type { Game, Track } from '../types';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '../utils/common';

defineOptions({ name: 'Track' });

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const game = ref<Game>();
const trackList = ref<Track[]>([]);
const relateList = ref<Game[]>([]);
const gameImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const trackImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const loading = ref<boolean>(false);
const showTrack = ref<boolean>(true);

onMounted(async () => {
  await getTrackList();
  await getRelateList();
});

async function getTrackList() {
  loading.value = true;
  try {
    const res = await axios.get(`/api/game/track/${gid}`);
    game.value = res.data.game as Game;
    trackList.value = res.data.tracks;

    for (const lang of store.langList) {
      let imgMap = new Map<string, string>();
      imgMap.set(game.value.id, getImgSrc(game.value, lang.id));
      gameImgMap.value.set(lang.id, imgMap);

      if (!trackImgMap.value.has(lang.id)) {
        imgMap = new Map<string, string>();
        for (const track of trackList.value) {
          imgMap.set(track.id, getImgSrc(track, lang.id));
        }
        trackImgMap.value.set(lang.id, imgMap);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function getRelateList() {
  try {
    const res = await axios.get(`/api/game/relate/${gid}`);
    relateList.value = res.data;
    for (const lang of store.langList) {
      const imgMap = gameImgMap.value.get(lang.id);
      for (const game of relateList.value) {
        imgMap?.set(game.id, getImgSrc(game, lang.id));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 992px;
  margin: 0.2rem auto 3rem;
  padding: 1rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  transform: translateY(0.5rem);

  .game {
    display: flex;
    min-height: 200px;
    margin-bottom: 1rem;
    padding-bottom: 1rem;

    > img {
      display: block;
      width: 200px;
      height: 200px;
    }

    > div {
      flex: 1;
      padding-left: 2rem;
      text-align: left;
    }
  }

  .tabs {
    display: flex;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid rgba(128, 128, 128, 0.5);

    .tab {
      flex: 1;
      border-bottom: 1px solid rgba(128, 128, 128, 0.5);
      padding: 10px 20px;
      opacity: 0.3;
      cursor: pointer;

      &.active {
        opacity: 1;
        font-weight: bold;
      }

      &.blank {
        visibility: hidden;
      }
    }
  }

  .track {
    padding-top: 0.8rem;
    text-align: left;

    > div {
      display: flex;
      padding: 0.5rem 0;

      > div {
        &:first-child {
          width: 200px;
          height: 100px;

          > img {
            display: block;
            height: 100px;
            margin: 0 auto;
          }
        }

        &:last-child {
          flex: 1;
          padding-left: 1rem;

          p {
            font-size: 0.8rem;
          }
        }
      }
    }
  }

  h2,
  h4 {
    margin: 0 0 0.5rem;
    small {
      display: inline-block;
      color: rgba(128, 128, 128, 0.7);

      &.xs-visible {
        display: none;
      }
    }
  }

  p {
    margin: 0 0 0.2rem;
    font-size: 0.9rem;
    opacity: 0.5;

    > b {
      display: inline-block;
      width: 3.5rem;
    }
  }

  img {
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  .container {
    margin-top: 1.5rem;
    box-shadow: none !important;
    font-size: 0.7rem;

    .game {
      min-height: 90px;
      padding-bottom: 0;

      > img {
        width: 80px;
        height: 80px;
      }

      > div {
        padding-left: 1rem;
      }
    }

    .track {
      > div {
        > div:first-child {
          display: none !important;
        }
      }
    }

    h4 {
      font-size: 0.8rem;

      small {
        &.xs-visible {
          display: inline-block;
          margin-left: 0.5em;
        }
      }
    }

    p {
      display: none;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .container {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
  }
}
</style>
