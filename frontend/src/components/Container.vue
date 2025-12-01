<template>
  <div class="loading" v-if="loading"></div>
  <template v-else><slot></slot></template>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<style>
.loading {
  width: 40px;
  height: 40px;
  margin: 60px auto;
  border: 4px solid #ccc;
  border-top-color: #3498db;
  border-radius: 50%;
  opacity: 0.5;
  transform: translateY(48px);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: translateY(48px) rotate(360deg);
  }
}
</style>
