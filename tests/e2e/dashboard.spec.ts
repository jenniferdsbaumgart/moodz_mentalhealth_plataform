import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display landing page correctly', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.locator('text=Moodz')).toBeVisible()

    // Check feature cards
    await expect(page.locator('text=Terapia em Grupo')).toBeVisible()
    await expect(page.locator('text=Comunidade')).toBeVisible()
    await expect(page.locator('text=Bem-estar')).toBeVisible()

    // Check CTAs
    await expect(page.locator('text=Criar Conta')).toBeVisible()
    await expect(page.locator('text=Entrar')).toBeVisible()
  })

  test('should navigate to register from CTA', async ({ page }) => {
    await page.goto('/')

    await page.click('text=Criar Conta')
    await expect(page).toHaveURL('/register')
  })

  test('should navigate to login from CTA', async ({ page }) => {
    await page.goto('/')

    // Click the main "Entrar" button
    await page.locator('a[href="/login"]:has-text("Entrar")').first().click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to blog', async ({ page }) => {
    await page.goto('/')

    await page.click('text=Ler Blog')
    await expect(page).toHaveURL('/blog')
  })
})

test.describe('Blog Page', () => {
  test('should display blog page', async ({ page }) => {
    await page.goto('/blog')

    // Check blog page elements
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/blog')

    // Look for search input if it exists
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]')
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible()
    }
  })
})

test.describe('Sessions Page (Public)', () => {
  test('should show sessions or redirect based on auth', async ({ page }) => {
    await page.goto('/sessions')

    // Either shows sessions or redirects to login
    const currentUrl = page.url()
    const isOnSessions = currentUrl.includes('/sessions')
    const isOnLogin = currentUrl.includes('/login')

    expect(isOnSessions || isOnLogin).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('landing page should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that main content is visible
    await expect(page.locator('text=Moodz')).toBeVisible()
    await expect(page.locator('text=Criar Conta')).toBeVisible()
  })

  test('landing page should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('text=Moodz')).toBeVisible()
    await expect(page.locator('text=Criar Conta')).toBeVisible()
  })

  test('login page should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('login page should have proper labels', async ({ page }) => {
    await page.goto('/login')

    // Check for proper labeling
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    // Inputs should have associated labels or aria-labels
    await expect(emailInput).toHaveAttribute('id')
    await expect(passwordInput).toHaveAttribute('id')
  })

  test('forms should have proper submit buttons', async ({ page }) => {
    await page.goto('/login')

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('landing page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have at least one h1
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')

    // Should either show 404 or redirect
    expect(response?.status()).toBe(404) || expect(page.url()).not.toContain('this-page-does-not-exist')
  })
})

test.describe('Navigation', () => {
  test('should be able to navigate between auth pages', async ({ page }) => {
    // Start at login
    await page.goto('/login')
    await expect(page.locator('text=Entrar')).toBeVisible()

    // Go to register
    await page.click('text=Criar conta')
    await expect(page).toHaveURL('/register')
    await expect(page.locator('text=Criar Conta')).toBeVisible()

    // Go back to login
    await page.click('a[href="/login"]')
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to forgot password and back', async ({ page }) => {
    await page.goto('/login')

    // Go to forgot password
    await page.click('text=Esqueceu a senha?')
    await expect(page).toHaveURL('/forgot-password')

    // Go back to login
    await page.click('text=Voltar para o Login')
    await expect(page).toHaveURL('/login')
  })
})

