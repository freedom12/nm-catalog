import { createRouter, createWebHistory } from 'vue-router';
import Game from '../components/Game.vue';
import Track from '../components/Track.vue';
import Upload from '../components/Upload.vue';

const routes = [
  { path: '/', component: Game },
  { path: '/:gid', component: Track },
  { path: '/upload', component: Upload },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
