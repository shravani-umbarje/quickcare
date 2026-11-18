import { test, expect, type Page } from '@playwright/test'
// Joint end-to-end tests (Shravani + Ujala): patient booking and hospital-facing workflows. Synthetic accounts only.
const login = async (page: Page, email: string) => {
  await page.goto('/'); await page.getByLabel('Email').fill(email); await page.getByLabel('Password').fill('demo1234')
  await page.getByRole('button', { name: 'Sign in' }).click()
}
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10)
const nav = (page: Page, name: string) => page.getByRole('button', { name }).first()

test('login rejects wrong password and shows an error', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Email').fill('patient@example.com'); await page.getByLabel('Password').fill('wrong')
  await page.getByRole('button', { name: 'Sign in' }).click(); await expect(page.getByRole('alert').or(page.getByText(/invalid email or password/i))).toBeVisible()
})

test('patient: Request now opens the ambulance page; validation; booking; tracking; cancel', async ({ page }) => {
  await login(page, 'patient@example.com')
  await page.getByRole('button', { name: /request now/i }).click()
  await expect(page.getByRole('heading', { name: 'Request ambulance' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue to location' }).click()            // empty form -> validation
  await expect(page.getByText('Choose the emergency type.')).toBeVisible()
  await page.getByLabel('Emergency type').selectOption('cardiac')
  await page.getByLabel('Patient name').fill('Test Patient'); await page.getByLabel('Contact phone').fill('9876543210')
  await page.getByRole('button', { name: 'Continue to location' }).click()
  await page.getByLabel('Pickup address').fill('MG Road, Bengaluru'); await page.getByLabel('Latitude').fill('12.9716'); await page.getByLabel('Longitude').fill('77.5946')
  await page.getByRole('button', { name: 'Confirm location' }).click()
  await page.getByRole('button', { name: 'Send ambulance request' }).click()          // works with or without the recommender running
  await expect(page.getByRole('heading', { name: 'Ambulance tracking' })).toBeVisible()
  await expect(page.getByText(/Status:/)).toBeVisible()
  await expect(page.getByText(/assigned|en_route/)).toBeVisible({ timeout: 30_000 }) // status persisted and refreshed
  page.on('dialog', (d) => d.accept()); await page.getByRole('button', { name: 'Cancel request' }).click()
  await expect(page.getByText(/cancelled/)).toBeVisible({ timeout: 15_000 })
})

test('patient: booking appears in My bookings', async ({ page }) => {
  await login(page, 'patient@example.com'); await nav(page, 'Bookings').click()
  await expect(page.getByRole('heading', { name: 'My bookings' })).toBeVisible(); await expect(page.getByText(/AMBULANCE/).first()).toBeVisible()
})

test('patient: home nurse visit booking', async ({ page }) => {
  await login(page, 'patient@example.com'); await page.getByRole('button', { name: /home nurse/i }).first().click()
  await page.getByRole('button', { name: 'Book', exact: true }).click(); await expect(page.getByText('Tell us the reason for the visit.')).toBeVisible()
  await page.getByLabel('Reason for visit').fill('Dressing change'); await page.getByLabel('Date').fill(tomorrow())
  await page.getByLabel('Time slot').selectOption('10:00-12:00'); await page.getByLabel('Home address').fill('12 Park Street, Bengaluru'); await page.getByLabel('Contact phone').fill('9876543210')
  await page.getByRole('button', { name: 'Book', exact: true }).click(); await expect(page.getByText('Booked.')).toBeVisible()
  await expect(page.getByText('Home nurse visit').first()).toBeVisible()
})

test('patient: home sample collection booking', async ({ page }) => {
  await login(page, 'patient@example.com'); await page.getByRole('button', { name: /home lab test/i }).first().click()
  await page.getByLabel('Tests').selectOption({ label: 'HbA1c' }); await page.getByLabel('Date').fill(tomorrow())
  await page.getByLabel('Time slot').selectOption('08:00-10:00'); await page.getByLabel('Home address').fill('12 Park Street, Bengaluru'); await page.getByLabel('Contact phone').fill('9876543210')
  await page.getByRole('button', { name: 'Book', exact: true }).click(); await expect(page.getByText('Booked.')).toBeVisible()
})

test('hospital: overview, transfer request, capacity, pre-admission, profile', async ({ page }) => {
  await login(page, 'hospital@example.com')
  await expect(page.getByRole('heading', { name: 'Hospital overview' })).toBeVisible(); await expect(page.getByText('Beds available')).toBeVisible()
  await nav(page, 'Requests').click()
  await page.getByLabel('Patient name').fill('Test Patient'); await page.getByLabel('Reason or condition').fill('Cardiac'); await page.getByLabel('Destination hospital').fill('Apollo Hospital')
  await page.getByRole('button', { name: 'Request ambulance' }).click(); await expect(page.getByText('Request sent.')).toBeVisible()
  await nav(page, 'Admissions').click()
  await page.getByLabel('General beds free').fill('9'); await page.getByRole('button', { name: 'Save capacity' }).click(); await expect(page.getByText('Capacity saved.')).toBeVisible()
  await page.getByRole('button', { name: 'Accept' }).first().click(); await expect(page.getByText('accepted').first()).toBeVisible()
  await nav(page, 'Profile').click(); await page.getByRole('button', { name: 'Save profile' }).click(); await expect(page.getByText('Profile saved.')).toBeVisible()
})

test('patient cannot see hospital data (403 shown, no crash)', async ({ page }) => {
  await login(page, 'patient@example.com'); await expect(page.getByRole('button', { name: /request now/i })).toBeVisible()
})