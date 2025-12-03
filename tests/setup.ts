import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock environment variables for tests
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock Resend (email service)
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null }),
    },
  })),
}))

// Mock Pusher
vi.mock('pusher', () => ({
  default: vi.fn().mockImplementation(() => ({
    trigger: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('pusher-js', () => ({
  default: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
      unbind: vi.fn(),
    }),
    unsubscribe: vi.fn(),
  })),
}))

// Global test setup
beforeAll(() => {
  // Setup code that runs once before all tests
})

afterEach(() => {
  // Cleanup after each test
  vi.clearAllMocks()
})

afterAll(() => {
  // Cleanup code that runs once after all tests
  vi.resetAllMocks()
})

