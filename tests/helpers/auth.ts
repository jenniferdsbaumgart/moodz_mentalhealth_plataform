import { vi } from 'vitest'
import type { Page } from '@playwright/test'

/**
 * Mock session data for authenticated requests
 */
export function mockAuthSession(userData: {
  id: string
  email: string
  name: string
  role: 'PATIENT' | 'THERAPIST' | 'ADMIN' | 'SUPER_ADMIN'
}) {
  return {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Mock the auth function for integration tests
 */
export function mockAuth(session: ReturnType<typeof mockAuthSession> | null) {
  vi.mock('@/lib/auth', () => ({
    auth: vi.fn().mockResolvedValue(session),
  }))
}

/**
 * Create a mock request with auth headers
 */
export function createAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  session: ReturnType<typeof mockAuthSession>
) {
  return new Request(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-test-session': JSON.stringify(session),
    },
  })
}

/**
 * E2E: Login programmatically via API
 */
export async function loginViaApi(
  page: Page,
  credentials: { email: string; password: string }
) {
  // Navigate to login page
  await page.goto('/login')
  
  // Fill in credentials
  await page.fill('input[type="email"]', credentials.email)
  await page.fill('input[type="password"]', credentials.password)
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for navigation
  await page.waitForURL(/\/(dashboard|therapist|admin)/)
}

/**
 * E2E: Logout
 */
export async function logout(page: Page) {
  // Find and click logout button/link
  await page.click('[data-testid="logout-button"]')
  await page.waitForURL('/login')
}

/**
 * E2E: Register a new user
 */
export async function registerViaForm(
  page: Page,
  userData: { name: string; email: string; password: string }
) {
  await page.goto('/register')
  
  await page.fill('input#name', userData.name)
  await page.fill('input#email', userData.email)
  await page.fill('input#password', userData.password)
  await page.fill('input#confirmPassword', userData.password)
  
  await page.click('button[type="submit"]')
  
  // Wait for success state
  await page.waitForSelector('text=Conta Criada')
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`
}

/**
 * E2E: Fill in forgot password form
 */
export async function requestPasswordReset(page: Page, email: string) {
  await page.goto('/forgot-password')
  await page.fill('input[type="email"]', email)
  await page.click('button[type="submit"]')
  await page.waitForSelector('text=Email Enviado')
}

