import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// The admin talks to the NestJS backend through this proxy, so the session cookie is same-origin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const api = env.API_URL ?? 'http://localhost:4000'
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5173,
      strictPort: true,
      proxy: { '/api': api, '/uploads': api },
    },
    preview: { port: 5173, proxy: { '/api': api, '/uploads': api } },
  }
})
