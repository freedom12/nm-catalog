<template>
  <section :hidden="hidden">
    <ol>
      <li v-for="relate in data" :key="relate.id">
        <div>
          <img
            :src="imgMap?.get(store.mainLang)?.get(relate.id)"
            @click.stop="openSourceImg(relate, store.mainLang)"
            loading="lazy"
          />
        </div>
        <div>
          <h4>
            <router-link :to="`/game/${relate.id}`">
              {{ getLangTitle(relate, store.mainLang) }}</router-link
            >
            <span>{{ relate.year }} | {{ relate.hardware }}</span>
          </h4>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { useStore } from '@/stores';
import type { Game } from '@/types';
import { getLangTitle, openSourceImg } from '@/utils/data-utils';

defineProps<{
  hidden: boolean;
  data: Game[];
  imgMap: Map<string, Map<string, string>>;
}>();

const store = useStore();
</script>

<style lang="scss" scoped>
h4 {
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
  h4 {
    > span {
      font-size: smaller;
    }
  }
}
</style>
