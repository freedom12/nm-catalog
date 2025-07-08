<template>
  <div class="container">
    <div class="game" v-if="game">
      <img :src="gameImgMap.get(store.mainLang)" @click.stop="openSourceImg(game, store.mainLang)" loading="lazy" />
      <div>
        <h2>
          {{ getLangTitle(game, store.mainLang) }}<br />
          <small>{{ game.year }} | {{ game.hardware }}</small>
        </h2>
        <p v-for="lang of store.langList.filter((x) => isShowTitle(game, x.id))" :key="lang.id">
          <b>{{ lang.id }}</b> {{ getLangTitle(game, lang.id) }}
        </p>
      </div>
    </div>
    <div class="track">
      <h3>{{ trackList.length }} tracks</h3>
      <div v-for="track in trackList" :key="track.idx">
        <div>
          <img :src="trackImgMap?.get(store.mainLang)?.get(track)" @click.stop="openSourceImg(track, store.mainLang)" loading="lazy" />
        </div>
        <div>
          <h4>
            {{ track.idx }}. {{ getLangTitle(track, store.mainLang) }} <small>({{ track.duration }})</small>
          </h4>
          <p v-for="lang of store.langList.filter((x) => isShowTitle(track, x.id))" :key="lang.id">
            <b>{{ lang.id }}</b> {{ getLangTitle(track, lang.id) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useStore } from '../stores';
import type { Game, Track } from '../types';
import { getLangTitle, isShowTitle, getImgSrc, openSourceImg } from '../utils/common';

defineOptions({ name: 'Track' });
defineProps<{ game: Game }>();

const route = useRoute();
const gid = route.params.gid as string;
const store = useStore();
const game = ref<Game>();
const trackList = ref<Track[]>([]);
const gameImgMap = ref<Map<string, string>>(new Map<string, string>());
const trackImgMap = ref<Map<string, Map<Track, string>>>(new Map<string, Map<Track, string>>());

if (!store.gameList.length) {
  axios.get('/api/game').then((res) => {
    store.setGameList(res.data);
    getTrackList(res.data);
  });
} else {
  getTrackList(store.gameList);
}

function getTrackList(gameList: Game[]) {
  game.value = gameList.find((x: Game) => x.id === gid) as Game;
  const id = game.value.link || game.value.id;
  axios.get(`/api/game/${id}`).then((res) => {
    trackList.value = res.data;

    for (const lang of store.langList) {
      gameImgMap.value.set(lang.id, getImgSrc(game.value, lang.id));

      if (!trackImgMap.value.has(lang.id)) {
        const imgMap = new Map<Track, string>();
        for (const track of trackList.value) {
          imgMap.set(track, getImgSrc(track, lang.id));
        }
        trackImgMap.value.set(lang.id, imgMap);
      }
    }
  });
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
    border-bottom: 1px solid rgba(128, 128, 128, 0.5);
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

  .track {
    text-align: left;

    > h3 {
      margin-bottom: 0.8rem;
    }

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
  h3,
  h4 {
    margin: 0 0 0.5rem;
    small {
      color: rgba(128, 128, 128, 0.7);
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
