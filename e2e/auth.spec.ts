import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'test@paperlite.io'
const TEST_PASSWORD = 'TestPass123!'

test.describe('Authentication', () => {
    test('register page loads and shows form', async ({ page }) => {
        await page.route('**/api/auth/register', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh',
                    user: { id: 1, firstName: 'Test', lastName: 'User', email: TEST_EMAIL }
                })
            })
        })

        await page.goto('/register')
        await expect(page.getByLabel('First name')).toBeVisible()
        await expect(page.getByLabel('Last name')).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
    })

    test('user can register and is redirected to onboarding', async ({ page }) => {
        await page.route('**/api/auth/register', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh',
                    user: { id: 1, firstName: 'Test', lastName: 'User', email: TEST_EMAIL }
                })
            })
        })

        await page.goto('/register')
        await page.getByLabel('First name').fill('Test')
        await page.getByLabel('Last name').fill('User')
        await page.getByLabel('Email').fill(TEST_EMAIL)
        const passwordFields = page.getByLabel(/password/i)
        await passwordFields.first().fill(TEST_PASSWORD)
        await passwordFields.last().fill(TEST_PASSWORD)
        await page.getByRole('button', { name: /create account/i }).click()
        await expect(page).toHaveURL('/onboarding')
    })

    test('user can log in and is redirected to dashboard', async ({ page }) => {
        // Set onboarding_complete so it goes to dashboard
        await page.addInitScript(() => {
            localStorage.setItem('onboarding_complete', 'true')
        })

        await page.route('**/api/auth/login', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh',
                    user: { id: 1, firstName: 'Test', lastName: 'User', email: TEST_EMAIL }
                })
            })
        })

        await page.goto('/login')
        await page.getByLabel('Email').fill(TEST_EMAIL)
        await page.getByLabel('Password').fill(TEST_PASSWORD)
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page).toHaveURL('/dashboard')
    })

    test('invalid credentials show error message', async ({ page }) => {
        await page.route('**/api/auth/login', (route) => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Invalid email or password.' })
            })
        })

        await page.goto('/login')
        await page.getByLabel('Email').fill('wrong@example.com')
        await page.getByLabel('Password').fill('wrongpassword')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page.getByText(/invalid email or password/i)).toBeVisible()
    })

    test('logged-out user accessing /documents is redirected to login', async ({ page }) => {
        // Ensure no token is stored
        await page.addInitScript(() => {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
        })
        await page.goto('/documents')
        await expect(page).toHaveURL('/login')
    })
})
