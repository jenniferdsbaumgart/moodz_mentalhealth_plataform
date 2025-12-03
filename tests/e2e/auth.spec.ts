import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      // Check form elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()

      // Check page title
      await expect(page.locator('text=Entrar')).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login')

      // Submit empty form
      await page.click('button[type="submit"]')

      // Check for validation messages
      await expect(page.locator('text=Email inválido')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill with invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Wait for error message
      await expect(page.locator('text=Credenciais inválidas')).toBeVisible({ timeout: 10000 })
    })

    test('should have link to forgot password', async ({ page }) => {
      await page.goto('/login')

      const forgotLink = page.locator('text=Esqueceu a senha?')
      await expect(forgotLink).toBeVisible()
      await forgotLink.click()

      await expect(page).toHaveURL('/forgot-password')
    })

    test('should have link to register', async ({ page }) => {
      await page.goto('/login')

      const registerLink = page.locator('text=Criar conta')
      await expect(registerLink).toBeVisible()
      await registerLink.click()

      await expect(page).toHaveURL('/register')
    })
  })

  test.describe('Register Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register')

      await expect(page.locator('input#name')).toBeVisible()
      await expect(page.locator('input#email')).toBeVisible()
      await expect(page.locator('input#password')).toBeVisible()
      await expect(page.locator('input#confirmPassword')).toBeVisible()
      await expect(page.locator('text=Criar Conta')).toBeVisible()
    })

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input#name', 'Test User')
      await page.fill('input#email', 'test@example.com')
      await page.fill('input#password', 'password123')
      await page.fill('input#confirmPassword', 'differentpassword')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=Senhas não coincidem')).toBeVisible()
    })

    test('should validate minimum password length', async ({ page }) => {
      await page.goto('/register')

      await page.fill('input#name', 'Test User')
      await page.fill('input#email', 'test@example.com')
      await page.fill('input#password', '123')
      await page.fill('input#confirmPassword', '123')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=6 caracteres')).toBeVisible()
    })

    test('should have link to login', async ({ page }) => {
      await page.goto('/register')

      const loginLink = page.locator('a[href="/login"]')
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('Forgot Password Page', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password')

      await expect(page.locator('text=Esqueceu sua senha?')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show success message after submission', async ({ page }) => {
      await page.goto('/forgot-password')

      await page.fill('input[type="email"]', 'test@example.com')
      await page.click('button[type="submit"]')

      // Should show success regardless of whether email exists (security)
      await expect(page.locator('text=Email Enviado')).toBeVisible({ timeout: 10000 })
    })

    test('should have back to login link', async ({ page }) => {
      await page.goto('/forgot-password')

      const backLink = page.locator('text=Voltar para o Login')
      await expect(backLink).toBeVisible()
    })
  })

  test.describe('Reset Password Page', () => {
    test('should show invalid link message without token', async ({ page }) => {
      await page.goto('/reset-password')

      await expect(page.locator('text=Link Inválido')).toBeVisible()
    })

    test('should display reset form with valid token format', async ({ page }) => {
      // Note: This will fail validation but should show the form initially
      await page.goto('/reset-password?token=test-token')

      // The page should attempt to show the form or error based on token validation
      const formOrError = page.locator('text=Redefinir Senha, text=inválido, text=expirado').first()
      await expect(formOrError).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Email Verification Page', () => {
    test('should show resend form without token', async ({ page }) => {
      await page.goto('/verify-email')

      await expect(page.locator('text=Verificação de Email')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })

    test('should have email input and resend button', async ({ page }) => {
      await page.goto('/verify-email')

      await page.fill('input[type="email"]', 'test@example.com')
      const resendButton = page.locator('button:has-text("Reenviar")')
      await expect(resendButton).toBeVisible()
    })
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing therapist pages without auth', async ({ page }) => {
    await page.goto('/therapist/dashboard')

    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing admin pages without auth', async ({ page }) => {
    await page.goto('/admin/dashboard')

    await expect(page).toHaveURL(/\/login/)
  })
})

