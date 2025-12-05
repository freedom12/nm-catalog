<template>
  <section :hidden="hidden">
    <div class="radio-group">
      <label
        v-for="(label, key) in TrackMode"
        :key="key"
        :class="{ disabled: !getTrackCount(key) }"
      >
        <input type="radio" :value="key" v-model="trackMode" />
        <span>{{ label }} ({{ getTrackCount(key) }})</span>
      </label>
    </div>
    <TrackItem
      v-for="track in data"
      :key="track.id"
      :data="track"
      :hidden="
        (trackMode === 'TOP' && !track.isbest) || (trackMode === 'LOOP' && !track.isloop)
      "
    ></TrackItem>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TrackItem from '@/components/TrackItem.vue';
import { TrackMode, type Track } from '@/types';

const props = defineProps<{
  hidden: boolean;
  data: Track[];
}>();

const trackMode = ref<TrackMode>('ALL');

function getTrackCount(mode: TrackMode): number {
  switch (mode) {
    case 'ALL':
      return props.data.length;
    case 'TOP':
      return props.data.filter((x) => x.isbest).length;
    case 'LOOP':
      return props.data.filter((x) => x.isloop).length;
  }
}
</script>

<style lang="scss" scoped>
.radio-group {
  margin-bottom: 1.5em;
  text-align: right;
}
</style>
