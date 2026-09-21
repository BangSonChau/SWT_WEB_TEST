import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/specs',
  fullyParallel: false,
  reporter: [['html'], ['../reporters/excel-reporter.ts']],
  use: {
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
