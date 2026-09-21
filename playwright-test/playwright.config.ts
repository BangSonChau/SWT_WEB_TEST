import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  // Đăng ký song song cả bảng HTML và Custom Excel Reporter
  reporter: [
    ['html'],
    ['./reporters/excel-reporter.ts'],
  ],
  use: {
    baseURL: 'http://localhost:5143',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});