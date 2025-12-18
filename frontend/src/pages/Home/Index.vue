<template>
  <Header :static="true"></Header>
  <div id="select">
    <select name="groupby" v-model="groupBy" @change="onGroupByChange" ref="selectRef">
      <option v-for="(label, key) in GameGroupBy" :key="key" :value="key">
        {{ label }}
      </option>
    </select>
  </div>
  <Container :loading="loading">
    <main>
      <section
        class="group"
        v-for="(group, i) in computedGameGroups"
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
            <router-link :to="`/game/${game.id}`" :title="game.$title">
              <img v-fallback :src="game.$imgPath" loading="lazy" />
              <span>{{ game.$title }}</span>
            </router-link>
          </li>
        </ul>
      </section>
      <SideNav
        :target="groupRefs"
        :options="computedGroupNames"
        :step="groupBy === 'RELEASE' ? 5 : 1"
        v-model:title="currentGroup"
        v-if="computedGameGroups.length"
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
  </Container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Header from '@/components/Header.vue';
import Container from '@/components/Container.vue';
import SideNav from '@/components/SideNav';
import SvgIcon from '@/components/SvgIcon.vue';
import { GameGroupBy, type GameGroup } from '@/types';
import { getGames } from '@/api';

defineOptions({ name: 'Home' });

const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const gameDict: {
  [key in GameGroupBy]: { key: 'hardware' | 'release' | 'recent'; content: GameGroup[] };
} = {
  PLATFORM: { key: 'hardware', content: [] },
  RELEASE: { key: 'release', content: [] },
  ADDED: { key: 'recent', content: [] },
};
const groupBy = ref<GameGroupBy>('PLATFORM');
const gameGroups = ref<GameGroup[]>([]);
const currentGroup = ref<string>();
const selectRef = ref<HTMLElement>();
const groupRefs = ref<HTMLElement[]>([]);

const computedGameGroups = computed(() =>
  gameGroups.value.map((x) => ({
    ...x,
    games: x.games.map((y) => ({
      ...y,
      $title: stringMap.getString(y, 'title'),
      $imgPath: imgMap.getPath('game', y),
    })),
  }))
);
const computedGroupNames = computed(() => computedGameGroups.value.map((x) => x.name));

onMounted(async () => {
  await onGroupByChange();
});

async function getGamesByGroup(groupBy: GameGroupBy): Promise<GameGroup[]> {
  const target = gameDict[groupBy];
  if (target.content.length > 0) {
    return target.content;
  }

  const result = await request(getGames(target.key));
  target.content = result;

  if (!gameGroups.value.length) {
    const gameList = result.map((x) => x.games).reduce((a, b) => [...a, ...b]);
    imgMap.setData('game', gameList);
    stringMap.setData(gameList, 'title');
  }

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
