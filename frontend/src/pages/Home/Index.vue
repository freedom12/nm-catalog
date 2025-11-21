<template>
  <Header :static="true"></Header>
  <div id="select">
    <select name="groupby" v-model="groupBy" @change="onGroupByChange" ref="selectRef">
      <option v-for="(label, key) in GameGroupBy" :key="key" :value="key">
        {{ label }}
      </option>
    </select>
  </div>
  <div class="loading" v-if="loading"></div>
  <main v-else>
    <section
      class="group"
      v-for="(group, i) in gameGroups"
      :key="group.name"
      :ref="
        (el) => {
          if (el) {groupRefs[i] = el as HTMLElement};
        }
      "
    >
      <h3>{{ group.name }}</h3>
      <ul class="game">
        <li class="card" v-for="game in group.games" :key="game.id">
          <img
            :src="gameImgMap?.get(store.mainLang)?.get(game.id)"
            @click.stop="route.push(`/game/${game.id}`)"
            loading="lazy"
          />
          <router-link :to="`/game/${game.id}`" :title="getLangTitle(game, store.mainLang)">
            {{ getLangTitle(game, store.mainLang) }}
          </router-link>
        </li>
      </ul>
    </section>
    <SideNav
      :target="groupRefs"
      :options="gameGroups.map((x) => x.name.toString())"
      :gap="groupBy === 'RELEASE' ? 5 : 1"
      v-model:title="currentGroup"
      v-if="gameGroups.length"
    >
      <div id="sort-select">
        <span> <SvgIcon type="category" width="24px"></SvgIcon> </span>
        <div>
          <ul>
            <li
              v-for="(label, key) in GameGroupBy"
              :key="key"
              :class="{ active: groupBy === key }"
              @click.stop="changeGroupBy(key)"
            >
              <span>{{ label }}</span>
            </li>
          </ul>
        </div>
      </div>
    </SideNav>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useStore } from '@/stores';
import Header from '@/components/Header.vue';
import SideNav from '@/components/SideNav';
import SvgIcon from '@/components/SvgIcon.vue';
import { GameGroupBy, type GameGroup } from '@/types';
import { getLangTitle, getImgSrc } from '@/utils/data-utils';

defineOptions({ name: 'Home' });

const route = useRouter();
const store = useStore();
const gameDict: {
  [key in GameGroupBy]: { url: string; content: GameGroup[] };
} = {
  PLATFORM: { url: '/api/game/hardware', content: [] },
  RELEASE: { url: '/api/game/release', content: [] },
  ADDED: { url: '/api/game/recent', content: [] },
};
const groupBy = ref<GameGroupBy>('PLATFORM');
const gameGroups = ref<GameGroup[]>([]);
const currentGroup = ref<string>();
const gameImgMap = ref<Map<string, Map<string, string>>>(
  new Map<string, Map<string, string>>()
);
const loading = ref<boolean>(false);
const selectRef = ref<HTMLElement>();
const groupRefs = ref<HTMLElement[]>([]);

onMounted(async () => {
  await onGroupByChange();

  const gameList = gameGroups.value.map((x) => x.games).reduce((a, b) => [...a, ...b]);
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

async function getGamesByGroup(groupBy: GameGroupBy): Promise<GameGroup[]> {
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
    const cache = localStorage.getItem('groupBy') || '';
    value = Object.keys(GameGroupBy).includes(cache) ? cache : groupBy.value;
    groupBy.value = value as GameGroupBy;
  } else {
    value = (event.target as HTMLSelectElement).value;
  }
  gameGroups.value = await getGamesByGroup(value as GameGroupBy);
  localStorage.setItem('groupBy', value);
  currentGroup.value = gameGroups.value[0].name;

  groupRefs.value = [];
  window.scrollTo(0, 0);
}

function changeGroupBy(value: GameGroupBy) {
  if (!selectRef.value) {
    return;
  }
  (selectRef.value as HTMLSelectElement).value = value;
  selectRef.value.dispatchEvent(new Event('change', { bubbles: true }));
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
