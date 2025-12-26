<template>
  <svg class="svg-icon" :style="{ color: fill, width: width, height: height ?? width }">
    <use :xlink:href="`#icon-${type}`" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  type?: string;
  fill?: string;
  width?: string;
  height?: string;
}>();
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>
