<template>
  <Header :observeRef="headerStore.observeRef">
    <component :is="headerStore.template" :data="headerStore.data" />
  </Header>
  <RouterView v-slot="{ Component, route }">
    <keep-alive>
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </RouterView>
  <Footer></Footer>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { useHeaderStore } from './stores';

const headerStore = useHeaderStore();
</script>
