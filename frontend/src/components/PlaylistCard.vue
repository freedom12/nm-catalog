<template>
    <div class="card">
        <router-link :to="`/playlist/${playlist.id}`" class="card-link">
            <img :src="getImgSrc(playlist, store.mainLang)" loading="lazy" />
            <div class="card-title">
                {{ getLangTitle(playlist, store.mainLang) }} · {{ playlist.tracksNum }}首
            </div>
        </router-link>
    </div>
</template>


<script setup lang="ts">
import { useStore } from '@/stores';
import { type Playlist } from '@/types';
import { getLangTitle, getImgSrc } from '@/utils/data-utils';

defineProps<{
    playlist: Playlist;
}>();

const store = useStore();
</script>

<style scoped>
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