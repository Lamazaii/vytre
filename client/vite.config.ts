import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup/setupTests.ts',
    include: ['src/test/unit/**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [
        'src/test/**',
        'src/main.ts',
        'src/App.vue',
        'src/**/shapeCanvas.vue',
        'src/**/readerViewCanvas.vue',
        'src/**/popup/CanvasZoomPopUp.vue',
      ],
    },
  },
})
