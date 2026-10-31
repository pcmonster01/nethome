import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  base: '/nethome/', // 👈 ADD THIS LINE (Replace with your actual repo name)
})
