import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import serveStatic from 'serve-static';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    target: 'es2015',
  },
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/icons')],
      symbolId: 'icon-[name]',
      inject: 'body-first',
      customDomId: '__svg__icons__dom__',
    }),
    {
      name: 'static-assets',
      configureServer(server) {
        server.middlewares.use(
          '/assets',
          serveStatic(path.resolve(__dirname, '../assets'))
        );
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.vue'],
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
});
