// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts', // 테스트 전역 설정 파일
    exclude: ['./tests/**'], // Playwright 테스트 파일 제외
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
