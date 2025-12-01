<template>
  <section :hidden="hidden">
    <div class="group" v-for="group in groupedPlaylists" :key="group.type">
      <h3 class="group-title">{{ group.type }}</h3>
      <ul class="playlist">
        <li v-for="playlist in group.playlists" :key="playlist.id">
          <PlaylistCard :playlist="playlist" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PlaylistType, type Playlist } from '@/types';
import PlaylistCard from '@/components/PlaylistCard.vue';

const props = defineProps<{
  hidden: boolean;
  data: Playlist[];
  imgMap: Map<string, Map<string, string>>;
}>();

// 按 type 分组播放列表
const groupedPlaylists = computed(() => {
  const groups = new Map<string, Playlist[]>();

  props.data.forEach(playlist => {
    const type = getPlaylistTypeLabel(playlist.type);
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(playlist);
  });

  return Array.from(groups.entries()).map(([type, playlists]) => ({
    type,
    playlists
  }));
});

function getPlaylistTypeLabel(playlistType: string): string {
  switch (playlistType) {
    case PlaylistType.MULTIPLE:
      return '包含系列游戏的播放列表';
    case PlaylistType.SINGLE_GAME:
      return '包含单独游戏的播放列表';
    default:
      return '';
  }
}
</script>

<style scoped>
.group {
  margin-bottom: 32px;
}

.group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
}

.playlist {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
