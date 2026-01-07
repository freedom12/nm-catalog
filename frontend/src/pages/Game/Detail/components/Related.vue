<template>
  <section :hidden="hidden">
    <ol>
      <li v-for="relate in data" :key="relate.id" class="common-detail">
        <div class="detail-image">
          <img
            v-fallback
            :src="imgMap.getPath('game', relate)"
            @click.stop="openSourceImg(relate, langStore.mainLang)"
            loading="lazy"
          />
        </div>
        <div class="detail-text">
          <h3 class="text-main">
            <router-link :to="`/game/${relate.id}`">
              {{ stringMap.getString(relate, 'title') }}</router-link
            >
            <span>{{ relate.year }} | {{ relate.hardware }}</span>
          </h3>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useLangStore } from '@/stores';
import { useImgMap } from '@/composables/useImgMap';
import { useLocalizationString } from '@/composables/useLocalizationString';
import type { Game } from '@/types';
import { openSourceImg } from '@/utils/data-utils';

defineProps<{
  hidden: boolean;
  data: Game[];
}>();

const langStore = useLangStore();
const imgMap = useImgMap();
const stringMap = useLocalizationString();
</script>

<style lang="scss" scoped>
h3 {
  > span {
    display: block;
    margin-top: 0.8em;
    opacity: 0.5;
    font-weight: normal;
    font-size: small;

    > span {
      display: none;
    }
  }
}

@media (max-width: 767px) {
  h3 {
    > span {
      font-size: smaller;
    }
  }
}
</style>
