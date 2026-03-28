import { test, expect } from '@playwright/test'

const MOCK_USER = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@paperlite.io' }
const MOCK_DOCUMENT = {
    id: 1,
    name: 'Test NDA',
    type: 'PDF',
    size: 12345,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}

function setupAuth(page: import('@playwright/test').Page) {
    return page.addInitScript(() => {
        localStorage.setItem('access_token', 'mock-token')
        localStorage.setItem('onboarding_complete', 'true')
        localStorage.setItem(
            'user',
            JSON.stringify({ id: 1, firstName: 'Test', lastName: 'User', email: 'test@paperlite.io' })
        )
    })
}

test.describe('Documents', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuth(page)
        page.route('**/api/auth/me', (route) =>
            route.fulfill({ status: 200, body: JSON.stringify(MOCK_USER) })
        )
    })

    test('authenticated user sees documents list', async ({ page }) => {
        await page.route('**/api/documents', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([MOCK_DOCUMENT])
            })
        )

        await page.goto('/documents')
        await expect(page.getByText('My Documents')).toBeVisible()
        await expect(page.getByText('Test NDA')).toBeVisible()
    })

    test('empty documents state shown when no documents', async ({ page }) => {
        await page.route('**/api/documents', (route) =>
            route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
        )

        await page.goto('/documents')
        await expect(page.getByText(/no documents yet/i)).toBeVisible()
    })

    test('user can open a document detail page', async ({ page }) => {
        await page.route('**/api/documents/1', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_DOCUMENT)
            })
        )
        await page.route('**/api/documents/1/field-values', (route) =>
            route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
        )
        await page.route('**/api/documents/1/generation-requests/latest', (route) =>
            route.fulfill({ status: 404 })
        )

        await page.goto('/documents/1')
        await expect(page.getByText('Fill in fields')).toBeVisible()
    })
})
