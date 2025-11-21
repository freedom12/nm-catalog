<template>
  <section :hidden="hidden">
    <div 
      class="group" 
      v-for="group in groupedPlaylists" 
      :key="group.type"
    >
      <h3 class="group-title">{{ getTypeLabel(group.type) }}</h3>
      <ul class="playlist">
        <li class="card" v-for="playlist in group.playlists" :key="playlist.id">
          <router-link :to="`/playlist/${playlist.id}`" class="card-link">
            <img :src="imgMap?.get(store.mainLang)?.get(playlist.id)" loading="lazy" />
            <div class="card-title">
              {{ getLangTitle(playlist, store.mainLang)}} ({{ playlist.tracksNum }})
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '@/stores';
import type { Playlist } from '@/types';
import { getLangTitle, openSourceImg } from '@/utils/data-utils';

const props = defineProps<{
  hidden: boolean;
  data: Playlist[];
  imgMap: Map<string, Map<string, string>>;
}>();

const store = useStore();

// 按 type 分组播放列表
const groupedPlaylists = computed(() => {
  const groups = new Map<string, Playlist[]>();
  
  props.data.forEach(playlist => {
    const type = playlist.type;
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

function getTypeLabel(type: string): string {
  const typeLabels: { [key: string]: string } = {
    'SINGLE_GAME': '单游戏播放列表',
    'MULTIPLE': '多游戏播放列表',
  };
  return typeLabels[type] || type;
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

.card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card img {
  width: 100%;
  height: 300px;
  object-fit: contain;
  object-position: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  background-color: #f8f9fa;
}

.card img:hover {
  opacity: 0.9;
}

.card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #333;
  height: 100%;
}

.card-title {
  padding: 16px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.card:hover .card-title {
  color: #007bff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .card img {
    height: 150px;
  }
  
  .card-title {
    padding: 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .playlist {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .card img {
    height: 120px;
  }
  
  .card-title {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
