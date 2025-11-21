<template>
  <Header :static="true"></Header>
  <main>
    <h2>播放列表</h2>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Header from '@/components/Header.vue';

onMounted(async () => {

});

</script>

<style lang="scss" scoped src="./styles.scss"></style>
