<template>
  <footer id="footer">
    <label>
      Main Language:
      <select name="lang" v-model="mainLang" @change="onLangChange">
        <option v-for="lang in langList" :key="lang" :value="lang">
          {{ lang }}
        </option>
      </select>
      <span @click.stop="scrollToTop()">Top ↑</span>
    </label>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { LangCode, type LangCodeValue } from '@/types';
import { useStore } from '@/stores';
import { scrollToY } from '@/utils/dom-utils';

const store = useStore();
const langList = Object.values(LangCode);
const mainLang = ref<LangCodeValue>(store.mainLang);

onMounted(async () => {
  store.setLangList(langList);
});

function onLangChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  store.setMainLang(value as LangCodeValue);
}

function scrollToTop() {
  scrollToY(0);
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
