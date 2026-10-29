import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Separate config for tests so the tailwind Vite plugin (build-only) is not loaded.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
