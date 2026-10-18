import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Backend ASP.NET Core Web API běží lokálně na 5229 (http profil v launchSettings.json).
      '/api': {
        target: 'http://localhost:5229',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // fetch v Node chce absolutní URL, v prohlížeči stačí relativní cesta.
    env: { VITE_API_URL: 'http://localhost' },
  },
})
