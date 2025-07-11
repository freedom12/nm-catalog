<template>
  <div class="choose">
    <select v-model="groupBy" @change="onGroupByChange">
      <option v-for="way in groupByWays" :key="way" :value="way">
        {{ way }}
      </option>
    </select>
  </div>
  <div class="loading" v-if="loading"></div>
  <template v-else>
    <div class="group" v-for="group in gameGroup" :key="group.name">
      <h3>{{ group.name }}</h3>
      <div class="game">
        <div class="card" v-for="game in group.games" :key="game.id">
          <img
            :src="gameImgMap?.get(store.mainLang)?.get(game.id)"
            @click.stop="route.push(`/${game.id}`)"
            loading="lazy"
          />
          <router-link :to="`/${game.id}`">{{
            getLangTitle(game, store.mainLang)
          }}</router-link>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useStore } from '../stores';
import { useRouter } from 'vue-router';
import type { Game, GameGroup } from '../types';
import { getLangTitle, getImgSrc } from '../utils/common';

defineOptions({ name: 'Game' });

const route = useRouter();
const store = useStore();
const groupByWays = ['By Platform', 'Added', 'Release'];
const gameDict: {
  [name: (typeof groupByWays)[number]]: { url: string; content: Game[] };
} = {
  'By Platform': { url: '/api/game/hardware', content: [] },
  Added: { url: '/api/game/recent', content: [] },
  Release: { url: '/api/game/release', content: [] },
};
const groupBy = ref<string>(groupByWays[0]);
const gameGroup = ref<GameGroup[]>([]);
const gameImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const loading = ref<boolean>(false);

onMounted(async () => {
  await onGroupByChange();

  const gameList = gameGroup.value.map((x) => x.games).reduce((a, b) => [...a, ...b]);
  for (const lang of store.langList) {
    if (!gameImgMap.value.has(lang.id)) {
      const imgMap = new Map<string, string>();
      for (const game of gameList) {
        imgMap.set(game.id, getImgSrc(game, lang.id));
      }
      gameImgMap.value.set(lang.id, imgMap);
    }
  }
});

async function getGamesByGroup(groupBy: (typeof groupByWays)[number]) {
  const target = gameDict[groupBy];
  if (target.content.length > 0) {
    return target.content;
  }

  let result = [];
  try {
    loading.value = true;
    const res = await axios.get(target.url);
    result = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
  target.content = result;
  return result;
}

async function onGroupByChange(event?: Event) {
  let value = '';
  if (!event) {
    value = localStorage.getItem('groupBy') || groupBy.value;
    groupBy.value = value;
  } else {
    value = (event.target as HTMLSelectElement).value;
  }
  gameGroup.value = await getGamesByGroup(value);
  localStorage.setItem('groupBy', value);
}
</script>

<style lang="scss" scoped>
$gap: 16px;

.choose {
  position: relative;
  z-index: 1;
  width: 97%;
  padding-top: 2.5rem;
  padding-right: 2em;
  text-align: right;
}

.group {
  h3 {
    margin-bottom: 0;
  }

  .game {
    display: flex;
    flex-wrap: wrap; /* 自动换行 */
    justify-content: center; /* 每一行内容居中 */
    padding: $gap;

    .card {
      width: 200px;
      height: 285px;
      margin: calc($gap / 2);
      border-radius: 8px;

      > img {
        display: block;
        width: 200px;
        height: 200px;
        margin-bottom: 8px;
        border-radius: 8px;
        cursor: pointer;
      }

      > a {
        font-size: 1.1rem;
        cursor: pointer;
      }
    }
  }
}

@media (max-width: 767px) {
  .choose {
    width: 100%;
  }

  .group {
    h3 {
      font-size: smaller;
    }

    .game {
      display: block;

      .card {
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        text-align: left;

        > img {
          display: inline-block;
          width: 50px;
          height: 50px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
        }

        a {
          flex: 1;
          display: block;
          margin: 0 1rem 0.5rem;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
