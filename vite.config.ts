import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        if (fs.existsSync('public/manifest.json')) {
          fs.copyFileSync('public/manifest.json', 'dist/manifest.json')
        } else {
          console.error('manifest.json not found in public folder')
        }
      },
    },
  ],
  build: {
    watch: {
      include: 'src/**',
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contentScript: resolve(__dirname, 'src/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'contentScript' ? 'contentScript.js' : '[name]-[hash].js';
        },
      },
    },
  },
  publicDir: 'public',
})