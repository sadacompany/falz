import { defineConfig, devices } from '@playwright/test'
import * as fs from 'fs'

const localHeadlessShell = 'C:\\Users\\user\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1200\\chrome-headless-shell-win64\\chrome-headless-shell.exe'
const localChrome = 'C:\\Users\\user\\AppData\\Local\\ms-playwright\\chromium-1200\\chrome-win64\\chrome.exe'

const executablePath = fs.existsSync(localHeadlessShell) ? localHeadlessShell : fs.existsSync(localChrome) ? localChrome : undefined

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'ar-SA',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
