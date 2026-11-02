import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5192, proxy: { '/api': 'http://localhost:3003' } }
})
