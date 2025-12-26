import { createRouter, createWebHistory } from 'vue-router';
import GameListComponent from '@/pages/Game/List/Index.vue';
import GameDetailComponent from '@/pages/Game/Detail/Index.vue';
import PlaylistListComponent from '@/pages/Playlist/List/Index.vue';
import PlaylistDetailComponent from '@/pages/Playlist/Detail/Index.vue';
// import UploadComponent from '@/pages/Upload.vue';
import { CACHENAME } from '@/types';

const routes = [
  {
    path: '/',
    redirect: () => {
      const first = localStorage.getItem(CACHENAME.FIRST);
      return first ?? '/game';
    },
  },
  { path: '/game', component: GameListComponent },
  { path: '/game/:gid', component: GameDetailComponent },
  { path: '/playlist', component: PlaylistListComponent },
  { path: '/playlist/:pid', component: PlaylistDetailComponent },
  // { path: '/upload', component: UploadComponent },
  { path: '/:pathMatch(.*)*', redirect: '/' },
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

router.afterEach(({ path }) => {
  if (['/game', '/playlist'].includes(path)) {
    localStorage.setItem(CACHENAME.FIRST, path);
  }
});

export default router;
