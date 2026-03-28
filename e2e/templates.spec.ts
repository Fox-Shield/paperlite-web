import { test, expect } from '@playwright/test'

const MOCK_USER = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@paperlite.io' }
const MOCK_TEMPLATE = {
    id: 'tmpl-1',
    name: 'NDA Template',
    description: 'Standard non-disclosure agreement',
    category: 'Legal',
    fields: []
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

test.describe('Templates', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuth(page)
        page.route('**/api/auth/me', (route) =>
            route.fulfill({ status: 200, body: JSON.stringify(MOCK_USER) })
        )
        page.route('**/api/subscriptions/my', (route) =>
            route.fulfill({
                status: 200,
                body: JSON.stringify({ plan: { tier: 'FREE', name: 'Free' }, status: 'ACTIVE' })
            })
        )
    })

    test('user can view template gallery', async ({ page }) => {
        await page.route('**/api/templates', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([MOCK_TEMPLATE])
            })
        )

        await page.goto('/templates')
        await expect(page.getByText('NDA Template')).toBeVisible()
    })

    test('user can view my templates page', async ({ page }) => {
        await page.route('**/api/workspaces/**/templates', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([MOCK_TEMPLATE])
            })
        )
        await page.route('**/api/workspaces', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: 'ws-1', name: "Test's workspace" }])
            })
        )

        await page.goto('/templates/my')
        await expect(page.getByText('My Templates')).toBeVisible()
    })

    test('template builder page loads with empty form', async ({ page }) => {
        await page.goto('/templates/new')
        await expect(page.getByText('Template Builder')).toBeVisible()
    })
})
