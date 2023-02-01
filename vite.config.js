// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    //sourcemap: true,
    assetsInlineLimit: 65536
  },
  publicDir: 'assets',
  server: {
    host: true,
  }
})