<template>
  <Header :static="true"></Header>
  <div class="loading" v-if="loading"></div>
  <main id="main" v-else>
    <div class="group" v-for="[name, section] in Object.entries(sections)" :key="name">
      <h3 class="group-title">{{ name }}</h3>
      <ul class="playlist">
        <li v-for="playlist in section" :key="playlist.id">
          <PlaylistCard :playlist="playlist" />
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Header from '@/components/Header.vue';
import { PlaylistType, type Playlist } from '@/types';
import PlaylistCard from '@/components/PlaylistCard.vue';

const loading = ref<boolean>(false);
const sections = ref<Record<string, Playlist[]>>({});
onMounted(async () => {
  loading.value = true;
  const response = await fetch('/playlist_section.json');
  const playlistSectionData = await response.json();
  for (const [sectionName, sectionPlaylists] of Object.entries(playlistSectionData)) {
    const playlists: Playlist[] = (sectionPlaylists as any[]).map((playlistData: any) => {
      const name = playlistData.name;
      const desc = playlistData.description;
      const img = playlistData.thumbnailURL.split('/').pop()?.split('.').shift();
      const playlist: Playlist = {
        id: playlistData.id,
        type: playlistData.type as PlaylistType,
        tracksnum: playlistData.tracksNum,
        isrelatedgame: 0,
        title_de_DE: name,
        title_en_US: name,
        title_es_ES: name,
        title_fr_FR: name,
        title_it_IT: name,
        title_ja_JP: name,
        title_ko_KR: name,
        title_zh_CN: name,
        title_zh_TW: name,
        img_de_DE: img,
        img_en_US: img,
        img_es_ES: img,
        img_fr_FR: img,
        img_it_IT: img,
        img_ja_JP: img,
        img_ko_KR: img,
        img_zh_CN: img,
        img_zh_TW: img,
        desc_de_DE: desc,
        desc_en_US: desc,
        desc_es_ES: desc,
        desc_fr_FR: desc,
        desc_it_IT: desc,
        desc_ja_JP: desc,
        desc_ko_KR: desc,
        desc_zh_CN: desc,
        desc_zh_TW: desc,
      };
      return playlist;
    });
    sections.value[sectionName] = playlists;
  }
  loading.value = false;
});

</script>

<style scoped>
#main {
  max-width: 992px;
  margin: 4rem auto 3rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
  transform: translateY(0.5rem);
}

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
