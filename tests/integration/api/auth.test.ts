import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    emailLog: {
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('@/lib/emails/service', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, id: 'test-email-id' }),
}))

import { db } from '@/lib/db'
import { sendEmail } from '@/lib/emails/service'

describe('Auth API - Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new user and send verification email', async () => {
    // Setup mocks
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.verificationToken.create).mockResolvedValue({
      identifier: 'test@example.com',
      token: 'test-token',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    vi.mocked(db.emailLog.create).mockResolvedValue({
      id: 'log-id',
      userId: 'test-user-id',
      type: 'email_verification',
      to: 'test@example.com',
      subject: 'Verifique seu email',
      status: 'PENDING',
      error: null,
      sentAt: null,
      createdAt: new Date(),
    })

    // Import the route handler
    const { POST } = await import('@/app/api/auth/register/route')

    // Create request
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123456',
      }),
    })

    // Execute
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.message).toContain('Verifique seu email')
    expect(data.requiresVerification).toBe(true)
    expect(db.user.create).toHaveBeenCalled()
    expect(db.verificationToken.create).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalled()
  })

  it('should return error if user already exists', async () => {
    // Setup mock - user exists
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'existing-user-id',
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { POST } = await import('@/app/api/auth/register/route')

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'test123456',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('já existe')
  })
})

describe('Auth API - Verify Email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should verify email with valid token', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000)
    
    vi.mocked(db.verificationToken.findUnique).mockResolvedValue({
      identifier: 'test@example.com',
      token: 'valid-token',
      expires: futureDate,
    })
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.user.update).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { GET } = await import('@/app/api/auth/verify-email/route')

    const request = new Request('http://localhost:3000/api/auth/verify-email?token=valid-token')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('verificado com sucesso')
  })

  it('should return error for expired token', async () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000)
    
    vi.mocked(db.verificationToken.findUnique).mockResolvedValue({
      identifier: 'test@example.com',
      token: 'expired-token',
      expires: pastDate,
    })

    const { GET } = await import('@/app/api/auth/verify-email/route')

    const request = new Request('http://localhost:3000/api/auth/verify-email?token=expired-token')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.expired).toBe(true)
  })

  it('should return error for invalid token', async () => {
    vi.mocked(db.verificationToken.findUnique).mockResolvedValue(null)

    const { GET } = await import('@/app/api/auth/verify-email/route')

    const request = new Request('http://localhost:3000/api/auth/verify-email?token=invalid-token')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('inválido')
  })
})

describe('Auth API - Forgot Password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send reset email for existing user', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.emailLog.count).mockResolvedValue(0)
    vi.mocked(db.verificationToken.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(db.verificationToken.create).mockResolvedValue({
      identifier: 'reset:test@example.com',
      token: 'reset-token',
      expires: new Date(Date.now() + 60 * 60 * 1000),
    })

    const { POST } = await import('@/app/api/auth/forgot-password/route')

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(sendEmail).toHaveBeenCalled()
  })

  it('should not reveal if email does not exist', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    const { POST } = await import('@/app/api/auth/forgot-password/route')

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    // Should return success to not reveal if email exists
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('should rate limit requests', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.emailLog.count).mockResolvedValue(3) // Already at limit

    const { POST } = await import('@/app/api/auth/forgot-password/route')

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.rateLimited).toBe(true)
  })
})

describe('Auth API - Reset Password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reset password with valid token', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000)
    
    vi.mocked(db.verificationToken.findUnique).mockResolvedValue({
      identifier: 'reset:test@example.com',
      token: 'valid-reset-token',
      expires: futureDate,
    })
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'old-hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.user.update).mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'new-hashed',
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const { POST } = await import('@/app/api/auth/reset-password/route')

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-reset-token',
        password: 'newpassword123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(db.user.update).toHaveBeenCalled()
    expect(db.verificationToken.delete).toHaveBeenCalled()
  })

  it('should reject short passwords', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route')

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'some-token',
        password: '123', // Too short
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('6 caracteres')
  })
})

