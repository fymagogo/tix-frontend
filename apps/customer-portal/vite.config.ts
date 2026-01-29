import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tix/ui': resolve(__dirname, '../../packages/ui/src'),
      '@tix/graphql': resolve(__dirname, '../../packages/graphql/src'),
    },
  },
  server: {
    port: 5173,
  },
})
