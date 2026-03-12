import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Planedoro/',
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
