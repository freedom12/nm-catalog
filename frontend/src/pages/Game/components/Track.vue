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
    <ol>
      <li
        v-for="track in data"
        :key="track.idx"
        :class="{
          hidden:
            (trackMode === 'TOP' && !track.isbest) ||
            (trackMode === 'LOOP' && !track.isloop),
        }"
      >
        <div>
          <img
            :src="imgMap?.get(store.mainLang)?.get(track.id)"
            @click.stop="openSourceImg(track, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div>
          <h4>
            {{ track.idx }}. {{ getLangTitle(track, store.mainLang) }}
            <small>({{ track.duration }})</small>
            <div class="tag">
              <SvgIcon type="star" :class="{ active: track.isbest }"></SvgIcon>
              <SvgIcon type="repeat" :class="{ active: track.isloop }"></SvgIcon>
            </div>
          </h4>
          <ul>
            <li
              v-for="lang of store.langList.filter((x) => isShowTitle(track, x.id))"
              :key="lang.id"
            >
              <b>{{ lang.id }}</b> {{ getLangTitle(track, lang.id) }}
            </li>
          </ul>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '@/stores';
import SvgIcon from '@/components/SvgIcon.vue';
import { TrackMode, type Track } from '@/types';
import { getLangTitle, isShowTitle, openSourceImg } from '@/utils/data-utils';

const props = defineProps<{
  hidden: boolean;
  data: Track[];
  imgMap: Map<string, Map<string, string>>;
}>();

const store = useStore();
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
@use '@/styles/variables.scss' as *;

.tag {
  position: absolute;
  top: 0.45em;
  right: 0.5em;
  display: flex;
  align-items: flex-start;
  height: 100%;

  .svg-icon {
    margin-left: 0.3em;
    opacity: 0.2;
    transform: translateY(-0.2em);

    &.active {
      opacity: 0.5;
    }
  }
}

@media (prefers-color-scheme: light) {
  .tag {
    .svg-icon {
      color: $root-linkColor;
      opacity: 0.4;

      &.active {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 767px) {
  .tag {
    .svg-icon {
      display: none;
    }
  }
}
</style>
