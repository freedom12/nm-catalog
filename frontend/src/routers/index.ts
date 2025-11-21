import { createRouter, createWebHistory } from 'vue-router';
import HomeComponent from '@/pages/Home';
import GameComponent from '@/pages/Game';
import PlaylistComponent from '@/pages/Playlist';
// import UploadComponent from '@/pages/Upload.vue';

const routes = [
  { path: '/', component: HomeComponent },
  { path: '/game/:gid', component: GameComponent },
  { path: '/playlist/:pid', component: PlaylistComponent },
  // { path: '/upload', component: UploadComponent },
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
