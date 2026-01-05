import { onActivated, watch } from 'vue';
import { useHeaderStore, type HeaderConfig } from '@/stores';

export const useHeader = (config?: HeaderConfig | (() => HeaderConfig)) => {
  const headerStore = useHeaderStore();

  onActivated(() => {
    const getConfig = () => (typeof config === 'function' ? config() : config);
    const cfg = getConfig();
    if (cfg) {
      if (cfg.data) {
        headerStore.set(cfg);
      } else {
        const stop = watch(
          () => getConfig(),
          (val) => {
            if (val?.observeRef && val.data) {
              headerStore.set(val);
              stop();
            }
          }
        );
      }
    } else {
      headerStore.clear();
    }
  });

  return { headerStore };
};
