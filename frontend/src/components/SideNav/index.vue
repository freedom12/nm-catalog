<template>
  <nav id="nav" ref="navRef" :class="{ hidden: options.length === 1 }">
    <div>
      <slot></slot>
    </div>
    <ul>
      <li
        v-for="(option, i) in options"
        :key="option"
        :data-name="getLabel(i, step)"
        :class="{ active: option === title, hidden: !!step && i % step > 0 }"
        :style="{
          transform: `translateY(${
            navheight * (percentages[i] + (1 - percentages[options.length - 1]) / 2)
          }px)`,
        }"
        @click.stop="navigateTo(i)"
      >
        <span>{{ title }} </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { ElementTracker } from '@/utils/element-tracker';
import { scrollToY } from '@/utils/dom-utils';

const props = defineProps<{
  target: HTMLElement[];
  options: string[];
  title?: string | number;
  step?: number;
}>();
const emit = defineEmits(['update:title']);
const percentages = ref<number[]>([]);
const navRef = ref<HTMLElement>();
const navheight = ref<number>(0);
const tracker = new ElementTracker((entries) => {
  const entry = entries.find((x) => x.isIntersecting);
  if (entry) {
    const step = props.step ?? 1;
    if (step === 1) {
      emit('update:title', entry!.target.firstElementChild?.innerHTML);
    } else {
      const idx = Math.floor(props.target.indexOf(entry!.target as HTMLElement));
      emit('update:title', props.target[idx - (idx % step)].firstElementChild?.innerHTML);
    }
  }
});
let scrollHandler!: (() => void) | null;

watch(
  () => props.target,
  async (elRef) => {
    tracker.disconnect();
    if (elRef.length) {
      const nums: number[] = [0];
      const sum = elRef
        .map((x) => x.offsetHeight)
        .reduce((a, b) => {
          nums.push(a);
          return a + b;
        });
      percentages.value = nums.map((x) => x / sum);
      await nextTick();
      tracker.observe(elRef);
    }
  },
  { immediate: true }
);

onMounted(() => {
  const observer = new ResizeObserver((entries) => {
    navheight.value = entries[0].contentRect.height;
  });
  observer.observe(navRef.value!);
});

async function navigateTo(idx: number) {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    scrollHandler = null;
  }
  emit('update:title', props.options[idx]);
  tracker.disconnect();

  const el = props.target[idx];
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 80, () => {
    scrollHandler = () => {
      window.removeEventListener('scroll', scrollHandler!);
      tracker.reconnect();
    };
    setTimeout(() => {
      window.addEventListener('scroll', scrollHandler!);
    }, 500);
  });
}

function getLabel(i: number, step = 1): string {
  if (step === 1) {
    return props.options[i];
  } else {
    const next = props.options[i + step - 1];
    return `${next ? `${next}-` : 'By '}${props.options[i]}`;
  }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>
