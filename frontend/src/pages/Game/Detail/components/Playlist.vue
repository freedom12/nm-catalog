<template>
  <section :hidden="hidden">
    <template v-for="group in computedPlaylistGroups" :key="group.label">
      <h2>{{ group.label }}</h2>
      <ul>
        <li v-for="playlist in group.playlists" :key="playlist.id">
          <PlaylistCard :playlist="playlist" />
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Playlist } from '@/types';
import PlaylistCard from '@/components/PlaylistCard.vue';

const props = defineProps<{
  hidden: boolean;
  data: Playlist[];
}>();
const playlistGroups = (() => {
  const groupMap = new Map<string, Playlist[]>();
  props.data.forEach((x) => {
    const type = ['SINGLE_GAME', 'MULTIPLE'].includes(x.type) ? x.type : '';
    if (!groupMap.has(type)) {
      groupMap.set(type, []);
    }
    groupMap.get(type)!.push(x);
  });
  return Array.from(groupMap.entries());
})();

const { t } = useI18n();

const computedPlaylistGroups = computed(() => {
  return playlistGroups.map(([type, playlists]) => ({
    label: t(`game.playlist.${type}`, { count: playlists.length }, { default: '' }),
    playlists,
  }));
});
</script>

<style lang="scss" scoped>
h2 {
  width: 60%;
  margin-top: 2rem;
  border-bottom: 1px solid $root-bgColor-light;
  padding-bottom: 0.5em;
  opacity: 0.4;
  text-align: left;
  font-size: 1.2rem;

  &:empty {
    margin: 0;
    border: none;
  }
}

ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, 180px);
  justify-content: space-evenly;
  gap: 24px 16px;

  &:last-child {
    margin-bottom: 1rem;
  }
}

@media (prefers-color-scheme: light) {
  h2 {
    border-color: $root-textColor-light;
  }
}

@media (max-width: 767px) {
  h2 {
    font-size: 1rem;
  }

  ul {
    display: block;
    text-align: left;

    > li {
      display: inline-block;
      margin: 0.5em 1em 1em;
      font-weight: bold;
    }
  }
}
</style>
