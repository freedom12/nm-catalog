<template>
  <div id="select">
    <select
      name="groupby"
      v-model="selectedGroupBy"
      @change="onGroupByChange"
      ref="selectRef"
    >
      <option
        v-for="groupBy in computedGameGroupBy"
        :key="groupBy.value"
        :value="groupBy.value"
      >
        {{ groupBy.label }}
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
        <h1>{{ group.name }}</h1>
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
        :step="selectedGroupBy === 'RELEASE' ? 5 : 1"
        v-model:title="currentGroup"
        v-if="computedGameGroups.length"
      >
        <div id="sort-select">
          <span> <SvgIcon type="category" width="24px"></SvgIcon> </span>
          <div>
            <ul>
              <li
                v-for="groupBy in computedGameGroupBy"
                :key="groupBy.value"
                :class="{ active: selectedGroupBy === groupBy.value }"
                @click.stop="changeGroupBy(groupBy.value)"
              >
                <span>{{ groupBy.label }}</span>
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
import { useI18n } from 'vue-i18n';
import { useHeader } from '@/composables/useHeader';
import { useRequest } from '@/composables/useRequest';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import Container from '@/components/Container.vue';
import SideNav from '@/components/SideNav/Index.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import { STORAGE_KEY, GameGroupBy, type GameGroup } from '@/types';
import { getGames } from '@/api';

const { t } = useI18n();
const { loading, request } = useRequest();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
const gameDict: Record<
  GameGroupBy,
  { key: 'hardware' | 'release' | 'recent'; content: GameGroup[] }
> = {
  PLATFORM: { key: 'hardware', content: [] },
  RELEASE: { key: 'release', content: [] },
  ADDED: { key: 'recent', content: [] },
};
const selectedGroupBy = ref<GameGroupBy>('PLATFORM');
const gameGroups = ref<GameGroup[]>([]);
const currentGroup = ref<string>();
const selectRef = ref<HTMLElement>();
const groupRefs = ref<HTMLElement[]>([]);

const computedGameGroupBy = computed(() => {
  return GameGroupBy.map((x) => ({
    label: t(`game.groupBy.${x}`),
    value: x,
  }));
});
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

useHeader();

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
    const cache = localStorage.getItem(STORAGE_KEY.GAME_GROUPBY);
    value = cache ?? selectedGroupBy.value;
    selectedGroupBy.value = value as GameGroupBy;
  } else {
    value = (event.target as HTMLSelectElement).value;
  }
  gameGroups.value = await getGamesByGroup(value as GameGroupBy);
  localStorage.setItem(STORAGE_KEY.GAME_GROUPBY, value);
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
