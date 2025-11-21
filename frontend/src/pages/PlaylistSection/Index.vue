<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading"></div>
  <main v-else>
    <div class="group" v-for="[name, section] in sections" :key="name">
      <h3 class="group-title">{{ name }}</h3>
      <ul class="playlist">
        <li class="card" v-for="playlist in section" :key="playlist.id">
          <router-link :to="`/playlist/${playlist.id}`" class="card-link">
            <img :src="getImgSrc(playlist, store.mainLang)" loading="lazy" />
            <div class="card-title">
              {{ getLangTitle(playlist, store.mainLang) }} · {{ playlist.tracksNum }}首
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import { useStore } from '@/stores';
import { LocalizationString, PlaylistType, type Playlist, type Track } from '@/types';

import { getLangTitle, getImgSrc } from '@/utils/data-utils';

const store = useStore();
const loading = ref<boolean>(false);
const sections = ref<Map<string, Array<Playlist>>>(new Map());
onMounted(async () => {
  loading.value = true;
  const response = await fetch('/playlist_section.json');
  const playlistSectionData = await response.json();
  for (const [sectionName, sectionPlaylists] of Object.entries(playlistSectionData)) {
    const playlists: Array<Playlist> = (sectionPlaylists as any[]).map((playlist: any) => {
      const name = playlist.name;
      const img = playlist.thumbnailURL.split('/').pop()?.split('.').shift();
      return {
        id: playlist.id,
        type: playlist.type as PlaylistType,
        tracksNum: playlist.tracksNum,
        isRelatedGame: 0,
        desc: new LocalizationString({'en_US': playlist.description}),
        title_de_DE: name,
        title_en_US: name,
        title_es_ES: name,
        title_fr_FR: name,
        title_it_IT: name,
        title_ja_IP: name,
        title_ko_KR: name,
        title_zh_CN: name,
        title_zh_TW: name,
        img_de_DE: img,
        img_en_US: img,
        img_es_ES: img,
        img_fr_FR: img,
        img_it_IT: img,
        img_ja_IP: img,
        img_ko_KR: img,
        img_zh_CN: img,
        img_zh_TW: img,
      } as Playlist;
    });
    sections.value.set(sectionName, playlists);
  }
  loading.value = false;
});

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
