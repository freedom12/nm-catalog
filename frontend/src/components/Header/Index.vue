<template>
  <header id="header">
    <div class="app-width">
      <div class="brand" @click.stop="router.push(`/`)">
        <img src="/favicon.svg" />
        {{ title }}
      </div>
      <button>
        <SvgIcon type="menu" width="24px" color="white"></SvgIcon>
      </button>
      <nav>
        <router-link
          v-for="(item, index) in computedMenu"
          :key="index"
          :to="item.path"
          :class="{ active: route.path.startsWith(item.path) }"
        >
          {{ item.name }}
        </router-link>
      </nav>
    </div>
  </header>
  <header id="subHeader" v-if="observeRef" :class="{ active: !refVisible }">
    <div class="app-width">
      <slot></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { MAIN_TITLE } from '@/types';
import { ElementTracker } from '@/utils/element-tracker';
import SvgIcon from '@/components/SvgIcon.vue';

const props = withDefaults(
  defineProps<{
    static?: boolean;
    observeRef?: HTMLElement;
  }>(),
  { static: false }
);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const title = MAIN_TITLE;
const refVisible = ref<boolean>(true);
const tracker = new ElementTracker((entries) => {
  const entry = entries[0];
  refVisible.value = entry.isIntersecting;
});

const computedMenu = computed(() => {
  return [
    {
      name: t('common.game'),
      path: '/game',
    },
    {
      name: t('common.playlist'),
      path: '/playlist',
    },
  ];
});

watch(
  () => props.observeRef,
  (elRef) => {
    tracker.disconnect();
    if (elRef) {
      tracker.observe(elRef);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped src="./styles.scss"></style>
