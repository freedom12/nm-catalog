<template>
  <section :hidden="hidden">
    <div class="radio-group">
      <label
        v-for="tag in computedTrackTags"
        :key="tag.key"
        :class="{ disabled: !tag.count }"
      >
        <input type="radio" :value="tag.key" v-model="selectedTrackTag" />
        <span>{{ t(`track.tag.${tag.key}`) }} ({{ tag.count }})</span>
      </label>
    </div>
    <TrackItem
      v-for="track in data"
      :key="track.id"
      :data="track"
      :hidden="
        (selectedTrackTag === 'TOP' && !track.isbest) ||
        (selectedTrackTag === 'LOOP' && !track.isloop)
      "
    >
    </TrackItem>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TrackItem from '@/components/TrackItem.vue';
import { TrackTag, type Track } from '@/types';

const props = defineProps<{
  hidden: boolean;
  data: Track[];
}>();

const { t } = useI18n();
const selectedTrackTag = ref<TrackTag>('ALL');

const computedTrackTags = computed(() => {
  return TrackTag.map((x) => ({
    key: x,
    label: t(`track.tag.${x}`),
    count: getTrackCount(x),
  }));
});

function getTrackCount(mode: TrackTag): number {
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
