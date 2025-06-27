<template>
  <header id="header" @click.stop="router.push(`/`)" v-if="showParent">Nintendo Music Catalog</header>
  <div class="mask" v-if="showParent"></div>
  <RouterView v-slot="{ Component, route }">
    <keep-alive include="Game,Track">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </RouterView>
  <Lang v-if="showParent"></Lang>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Lang from './components/Lang.vue';

const route = useRoute();
const router = useRouter();
document.title = 'Nintendo Music Catalog';

const showParent = computed(() => !route.path.includes('upload'));
</script>

<style lang="scss" scoped>
#header {
  position: relative;
  z-index: 2;
  width: 500px;
  margin: 0 auto;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  background-color: red;
  color: white;
  line-height: 2rem;
  font-weight: bolder;
  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  cursor: pointer;

  + .mask {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    background: linear-gradient(to bottom, #242424 5%, transparent 100%);
  }
}

@media (max-width: 767px) {
  #header {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    font-size: 0.9rem;
    line-height: 1.8rem;

    + .mask {
      height: 3.5rem;
    }
  }
}

@media (prefers-color-scheme: light) {
  #header {
    + .mask {
      background: linear-gradient(to bottom, #ffffff 5%, transparent 100%);
    }
  }
}
</style>
