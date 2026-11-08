import { defineConfig, devices } from '@playwright/test';

// A dedicated loopback server: never run these tests against a production site.
const baseURL = 'http://127.0.0.1:4175';
const artifacts = process.env.QA_ARTIFACT_DIR || '.artifacts/playwright';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000, toHaveScreenshot: { animations: 'disabled', maxDiffPixels: 0, threshold: 0 } },
  updateSnapshots: 'none',
  outputDir: `${artifacts}/results`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${artifacts}/html`, open: 'never' }],
    ['json', { outputFile: `${artifacts}/results.json` }],
  ],
  use: {
    baseURL,
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: 'block',
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: baseURL,
    env: { PORT: '4175', NEXT_TELEMETRY_DISABLED: '1' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: 'chromium', testMatch: '**/e2e/*.spec.ts', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'firefox', testMatch: '**/e2e/*.spec.ts', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 1000 } } },
    { name: 'webkit', testMatch: '**/e2e/*.spec.ts', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 1000 } } },
    { name: 'accessibility', testMatch: '**/accessibility/*.spec.ts', use: { browserName: 'chromium' } },
    {
      name: 'visual', testMatch: '**/visual/*.spec.ts', use: { browserName: 'chromium' },
      snapshotPathTemplate: '{testDir}/visual/__screenshots__/{platform}/{arg}{ext}',
    },
  ],
});
