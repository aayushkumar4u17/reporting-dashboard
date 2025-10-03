import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'


export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      ...(mode === 'development' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      minify: mode === 'production' ? 'terser' : 'esbuild',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            firebase: ['firebase/app', 'firebase/auth'],
            utils: ['axios']
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: {
        '/api/refreshToken': {
          target: 'https://us-central1-fuelbuddy-india.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error for refreshToken:', { hasError: true });
            });
          },
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
    define: {
      __VUE_PROD_DEVTOOLS__: mode !== 'production',
    },
  }
})