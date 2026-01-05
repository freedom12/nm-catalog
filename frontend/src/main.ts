import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/global.scss';
import App from './App.vue';
import router from './routers';
import fallbackImage from './plugins/fallbackImage';
import { i18n } from './i18n';
import { useLangStore } from './stores';
import 'virtual:svg-icons-register';

const app = createApp(App).use(createPinia()).use(router).use(fallbackImage).use(i18n);

const langStore = useLangStore();
langStore.setLocale(langStore.locale);

app.mount('#app');
