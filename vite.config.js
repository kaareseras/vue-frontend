import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vuePlugin from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Indlæs env-variabler fra .env eller .env.production afhængigt af mode
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue(), vuePlugin],

    // Tillad brug af @ som alias for ./src
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Serverkonfiguration gælder kun under udvikling
    server: {
      port: 3000,

      // Kun aktivér proxy i udvikling
      proxy: mode === 'development'
        ? {
            '/api': {
              target: env.VITE_DEV_API_TARGET, // Fx http://localhost:5000
              changeOrigin: true,
              rewrite: path => path.replace(/^\/api/, ''),
            },
          }
        : undefined, // Ingen proxy i produktion
    },
  }
})