import { defineWorkspace } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineWorkspace([
  {
    test: {
      name: 'client',
      root: './client',
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup/setupTests.ts',
      include: ['src/test/unit/**/*.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'], 
      },
    },
    plugins: [vue()]
  },
  {
    test: {
      name: 'server',
      root: './server',
      environment: 'node',
      globals: true,
      include: ['src/test/**/*.spec.ts', 'src/test/**/*.test.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'], 
      },
    }
  }
])
