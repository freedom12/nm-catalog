import type { App } from 'vue';

export const fallbackSrc = `data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' stroke='rgba(128,128,128,0.45)' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='4' y='4' width='24' height='24' rx='4' ry='4'/%3E%3Cpath d='M10 22l4-4 3 3 5-5'/%3E%3Ccircle cx='12.5' cy='12.5' r='2.2'/%3E%3C/svg%3E`;

type Img = HTMLImageElement & { fallbackBound: boolean; lastSrc: string };

export default {
  install(app: App) {
    app.directive('fallback', {
      mounted(img: Img) {
        if (img.fallbackBound) {
          return;
        }
        img.fallbackBound = true;
        img.lastSrc = img.src;
        img.addEventListener('error', () => {
          if (img.dataset.fallbackDone) {
            return;
          }
          img.dataset.fallbackDone = '';
          img.src = fallbackSrc;
        });
      },
      updated(img: Img) {
        if (img.src !== img.lastSrc) {
          delete img.dataset.fallbackDone;
          img.lastSrc = img.src;
        }
      },
    });
  },
};
