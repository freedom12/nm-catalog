import { defineStore } from 'pinia';
import type { VNode } from 'vue';

export interface HeaderConfig {
  observeRef?: HTMLElement;
  data?: Record<string, any>;
  template?: VNode[] | (() => VNode[]);
}

export const useHeaderStore = defineStore('header', {
  state: (): HeaderConfig => ({}),
  actions: {
    set(config: HeaderConfig) {
      this.observeRef = config.observeRef;
      this.data = config.data;
      this.template = config.template;
    },
    clear() {
      this.observeRef = undefined;
      this.data = undefined;
      this.template = undefined;
    },
  },
});
