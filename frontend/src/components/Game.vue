<template>
  <div class="choose">
    <select v-model="groupBy" @change="onGroupByChange">
      <option v-for="way in groupByWays" :key="way" :value="way">
        {{ way }}
      </option>
    </select>
  </div>
  <div class="group" v-for="group in gameGroup" :key="group.name">
    <h3>{{ group.name }}</h3>
    <div class="game">
      <div class="card" v-for="game in group.games" :key="game.id">
        <img :src="`./assets/img/${game.img}.jpg`" @click.stop="route.push(`/${game.id}`)" loading="lazy" />
        <router-link :to="`/${game.id}`">{{ getLangTitle(game, store.mainLang) }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useStore } from '../stores';
import { useRouter } from 'vue-router';
import type { Game, GameGroup, Hardware } from '../types';
import { getLangTitle } from '../utils/common';

defineOptions({ name: 'Game' });

const route = useRouter();
const store = useStore();
const gameList = ref<Game[]>([]);
const gameListByYear = ref<GameGroup[]>([]);
const gameListByDevice = ref<GameGroup[]>([]);
const groupByWays = ['By Platfom', 'Added', 'Release'];
const groupBy = ref<string>(groupByWays[0]);
let gameGroup = ref<GameGroup[]>([]);

axios
  .get('/api/game')
  .then((res) => {
    const result = res.data;
    store.setGameList(result);
    gameList.value = result;
    gameListByYear.value = getGameGroupByYear(result);
    return axios.get('/api/list/hardware');
  })
  .then((res) => {
    gameListByDevice.value = getGameGroupByDevice(gameList.value, res.data);
    gameGroup.value = gameListByDevice.value;
    onGroupByChange();
  });

function getGameGroupByYear(gameList: Game[]): GameGroup[] {
  const map = new Map<number, Game[]>();
  gameList.forEach((game: Game) => {
    if (!map.has(game.year)) {
      map.set(game.year, []);
    }
    map.get(game.year)?.push(game);
  });
  const result = Array.from(map.entries())
    .sort((a, b) => {
      return b[0] - a[0];
    })
    .map((x) => ({
      name: x[0].toString(),
      games: x[1],
    }));
  return result;
}

function getGameGroupByDevice(gameList: Game[], device: Hardware[]): GameGroup[] {
  device = device.sort((a, b) => b.year - a.year);
  const map = new Map<string, Game[]>();
  device.forEach((x) => {
    map.set(x.name.toLocaleLowerCase(), []);
  });
  gameList.forEach((x) => {
    map.get(x.hardware.toLocaleLowerCase())?.push(x);
  });
  const result = Array.from(map.entries()).map((x, i) => ({
    name: device[i].name,
    games: x[1],
  }));
  return result;
}

function onGroupByChange(event?: Event) {
  let value = '';
  if (!event) {
    value = localStorage.getItem('groupBy') || groupBy.value;
    groupBy.value = value;
  } else {
    value = (event.target as HTMLSelectElement).value;
  }
  switch (value) {
    case 'By Platfom':
      gameGroup.value = gameListByDevice.value;
      break;
    case 'Added':
      gameGroup.value = [
        {
          name: '',
          games: gameList.value,
        },
      ];
      break;
    case 'Release':
      gameGroup.value = gameListByYear.value;
      break;
  }
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
