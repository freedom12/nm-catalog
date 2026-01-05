<template>
  <div id="top-mark" ref="topRef"></div>
  <footer id="footer">
    <label>
      {{ t('info.lang') }}{{ t('punctuation.colon') }}
      <select name="lang" v-model="mainLang" @change="onLangChange">
        <option v-for="lang in langList" :key="lang" :value="lang">
          {{ lang }}
        </option>
      </select>
      <span :class="{ dim: isScrollTop }" @click.stop="scrollToTop()"
        >{{ t('info.top') }} ↑</span
      >
    </label>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LangCode, type LangCodeValue } from '@/types';
import { getLocale, useLangStore } from '@/stores';
import { scrollToY } from '@/utils/dom-utils';
import { ElementTracker } from '@/utils/element-tracker';
import type { LocaleType } from '@/i18n';

const { t } = useI18n();
const langStore = useLangStore();
const langList = Object.values(LangCode);
const mainLang = ref<LangCodeValue>(langStore.mainLang);
const topRef = ref<HTMLElement>();
const isScrollTop = ref<boolean>(false);
const tracker = new ElementTracker((entries) => {
  const entry = entries[0];
  isScrollTop.value = entry.isIntersecting;
});

onMounted(async () => {
  langStore.setLangList(langList);
  tracker.observe(topRef.value as unknown as HTMLElement);
});

function onLangChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  langStore.setMainLang(value as LangCodeValue);
  langStore.setLocale(getLocale(value as LocaleType), true);
}

function scrollToTop() {
  scrollToY(0);
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

#top-mark {
  position: absolute;
  top: 0;
  width: 1px;
  height: 1px;
}

#footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3em;
  background-color: rgba($footer-bgColor, 0.8);
  font-size: small;

  span {
    display: inline-flex;
    align-items: center;
    margin-left: 2rem;
    cursor: pointer;

    &.dim {
      opacity: 0.5;
    }
  }
}

@media (prefers-color-scheme: light) {
  #footer {
    color: rgba($root-textColor, 0.87);
  }
}

@media (max-width: 767px) {
  #footer {
    font-size: 0.9rem;

    span {
      margin-left: 1rem;
    }
  }
}
</style>
