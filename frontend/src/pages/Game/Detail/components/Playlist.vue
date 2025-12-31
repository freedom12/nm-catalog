<template>
  <section :hidden="hidden">
    <template v-for="group in computedPlaylistGroups" :key="group.label">
      <h3>{{ group.label }}</h3>
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

const { t } = useI18n();

const computedPlaylistGroups = computed(() => {
  const groupMap = new Map<string, Playlist[]>();
  props.data.forEach((x) => {
    const label = t(`game.playlist.${x.type}`, {}, { default: '' });
    if (!groupMap.has(label)) {
      groupMap.set(label, []);
    }
    groupMap.get(label)!.push(x);
  });

  return Array.from(groupMap.entries()).map(([label, playlists]) => ({
    label,
    playlists,
  }));
});
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

h3 {
  width: 60%;
  margin-top: 2rem;
  border-bottom: 1px solid $root-bgColor-light;
  padding-bottom: 0.5em;
  opacity: 0.4;
  text-align: left;

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
  h3 {
    border-color: $root-textColor-light;
  }
}

@media (max-width: 767px) {
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
