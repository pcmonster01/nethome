import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Since your site is deployed at the root domain pcmonster01.github.io, keep base as '/'
  build: {
    outDir: 'docs', // 👈 This tells Vite to build into 'docs' instead of 'dist'
  }
})
