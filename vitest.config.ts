import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.{test,spec}.{js,ts,vue}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/ui/src/components/**',
        'packages/graphql/src/composables/**'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ],
      thresholds: {
        lines: 80,
        functions: 70,
        branches: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@tix/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@tix/graphql': path.resolve(__dirname, 'packages/graphql/src')
    }
  }
})
