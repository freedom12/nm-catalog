<template>
  <footer id="footer">
    <label>
      Main Language:
      <select v-model="lang" @change="onLangChange">
        <option v-for="lang in langList" :key="lang.id" :value="lang.id">
          {{ lang.id }}
        </option>
      </select>
      <span @click.stop="scrollToTop">Top ↑</span>
    </label>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import type { Lang } from '../types';
import { useStore } from '../stores';

const store = useStore();
const langList = ref<Lang[]>([]);
const lang = ref<string>(store.mainLang);

axios.get('/api/list/lang').then((res) => {
  const result = res.data;
  store.setLangList(result);
  langList.value = res.data;
});

function onLangChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  store.setMainLang(value);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
</script>

<style lang="scss">
#footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3em;
  background-color: rgba(255, 255, 255, 0.7);

  span {
    display: inline-block;
    margin-left: 3rem;
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  #footer {
    font-size: 0.8rem;

    span {
      margin-left: 1rem;
    }
  }
}

@media (prefers-color-scheme: dark) {
  #footer {
    background-color: rgba(0, 0, 0, 0.7);
  }
}
</style>
