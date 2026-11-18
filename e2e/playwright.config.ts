import { defineConfig } from '@playwright/test'
// Starts the DEV fake API (4000) and the frontend (8443). When the real backend exists, remove the first webServer entry and point frontend/.env VITE_API_BASE at it.
export default defineConfig({
  testDir: './tests', timeout: 60_000, reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:8443', screenshot: 'on', trace: 'retain-on-failure', geolocation: undefined },
  webServer: [
    { command: 'node dev-api/server.mjs', cwd: '..', port: 4000, reuseExistingServer: true },
    { command: 'pnpm dev', cwd: '../frontend', port: 8443, reuseExistingServer: true, timeout: 120_000 },
  ],
})
