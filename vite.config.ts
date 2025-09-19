import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      // Only use dev tools in development
      ...(mode === 'development' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    build: {
      // Production optimizations
      minify: mode === 'production' ? 'terser' : 'esbuild',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            firebase: ['firebase/app', 'firebase/auth'],
            utils: ['axios']
          },
        },
      },
      // Build performance optimizations
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      // Proxy configuration to handle CORS issues with Firebase functions
      proxy: {
        '/api/refreshToken': {
          target: 'https://us-central1-fuelbuddy-india.cloudfunctions.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error for refreshToken:', { hasError: true });
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', { method: req.method, hasUrl: !!req.url });
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', { statusCode: proxyRes.statusCode, hasUrl: !!req.url });
            });
          },
        },
      },
    },
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },
    // Environment handling
    define: {
      __VUE_PROD_DEVTOOLS__: mode !== 'production',
    },
  }
})