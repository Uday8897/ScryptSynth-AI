import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/', // Explicitly set the base path to root
  plugins: [react(), tailwindcss()],
})
