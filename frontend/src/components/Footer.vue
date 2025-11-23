<template>
  <footer id="footer">
    <label>
      Main Language:
      <select name="lang" v-model="lang" @change="onLangChange">
        <option v-for="lang in langList" :key="lang.id" :value="lang.id">
          {{ lang.id }}
        </option>
      </select>
      <span @click.stop="scrollToTop()">Top ↑</span>
      <span @click.stop="goSectionGroup()">其他播放列表</span> 
    </label>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import type { Lang } from '@/types';
import { useStore } from '@/stores';
import { scrollToY } from '@/utils/dom-utils';
import router from '@/routers';

const store = useStore();
const langList = ref<Lang[]>([]);
const lang = ref<string>(store.mainLang);

onMounted(async () => {
  setupLang();
});

async function setupLang() {
  const cache = localStorage.getItem('langList');
  let result: Lang[];
  if (cache) {
    result = JSON.parse(cache);
  } else {
    result = (await axios.get('/api/list/lang')).data;
    localStorage.setItem('langList', JSON.stringify(result));
  }
  store.setLangList(result);
  langList.value = result;
}

function onLangChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  store.setMainLang(value);
}

function scrollToTop() {
  scrollToY(0);
}

// 临时放在这里
function goSectionGroup() {
  router.push(`/playlist-section`);
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

#footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3em;
  background-color: rgba($footer-bgColor, 0.8);

  span {
    display: inline-block;
    margin-left: 3rem;
    cursor: pointer;
  }
}

@media (prefers-color-scheme: light) {
  #footer {
    color: rgba($root-textColor, 0.87);
  }
}

@media (max-width: 767px) {
  #footer {
    font-size: 0.9rem;

    span {
      margin-left: 1rem;
    }
  }
}
</style>
