import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './Tests',
  testMatch: '**/blogappspec.js',
  use: {
    baseURL: 'http://localhost:5192',
  },
})
