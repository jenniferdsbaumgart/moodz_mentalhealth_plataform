import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    groupSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    sessionParticipant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    therapistProfile: {
      findUnique: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

describe('Sessions API - List Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return list of sessions for authenticated user', async () => {
    // Mock authenticated session
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PATIENT',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock sessions data
    vi.mocked(db.groupSession.findMany).mockResolvedValue([
      {
        id: 'session-1',
        title: 'Ansiedade - Grupo de Apoio',
        description: 'Sessão para discutir estratégias',
        category: 'ANXIETY',
        therapistId: 'therapist-profile-id',
        scheduledAt: new Date('2024-01-15T14:00:00Z'),
        duration: 60,
        maxParticipants: 10,
        status: 'SCHEDULED',
        roomName: null,
        roomUrl: null,
        coverImage: null,
        tags: [],
        reminderSent: false,
        startingSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const { GET } = await import('@/app/api/sessions/route')

    const request = new Request('http://localhost:3000/api/sessions')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessions).toBeDefined()
    expect(Array.isArray(data.sessions)).toBe(true)
  })

  it('should return 401 for unauthenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { GET } = await import('@/app/api/sessions/route')

    const request = new Request('http://localhost:3000/api/sessions')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('Sessions API - Therapist Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return therapist sessions', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'therapist-id',
        email: 'therapist@example.com',
        name: 'Dr. Test',
        role: 'THERAPIST',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    vi.mocked(db.therapistProfile.findUnique).mockResolvedValue({
      id: 'therapist-profile-id',
      userId: 'therapist-id',
      crp: 'CRP-12345',
      specialties: ['Ansiedade'],
      bio: 'Bio',
      education: null,
      experience: null,
      documentUrl: null,
      photoUrl: null,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: null,
      rejectionReason: null,
      hourlyRate: null,
      specializations: [],
      languages: [],
      sessionPrice: null,
      currency: 'BRL',
      availableForNew: true,
      publicBio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(db.groupSession.findMany).mockResolvedValue([
      {
        id: 'session-1',
        title: 'My Session',
        description: 'Description',
        category: 'ANXIETY',
        therapistId: 'therapist-profile-id',
        scheduledAt: new Date(),
        duration: 60,
        maxParticipants: 10,
        status: 'SCHEDULED',
        roomName: null,
        roomUrl: null,
        coverImage: null,
        tags: [],
        reminderSent: false,
        startingSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const { GET } = await import('@/app/api/therapist/sessions/route')

    const request = new Request('http://localhost:3000/api/therapist/sessions')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sessions).toBeDefined()
  })

  it('should reject non-therapist users', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'patient-id',
        email: 'patient@example.com',
        name: 'Patient',
        role: 'PATIENT',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    const { GET } = await import('@/app/api/therapist/sessions/route')

    const request = new Request('http://localhost:3000/api/therapist/sessions')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})

describe('Sessions API - Enroll in Session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow patient to enroll in session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'patient-id',
        email: 'patient@example.com',
        name: 'Patient',
        role: 'PATIENT',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    vi.mocked(db.groupSession.findUnique).mockResolvedValue({
      id: 'session-1',
      title: 'Test Session',
      description: 'Description',
      category: 'ANXIETY',
      therapistId: 'therapist-profile-id',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 60,
      maxParticipants: 10,
      status: 'SCHEDULED',
      roomName: null,
      roomUrl: null,
      coverImage: null,
      tags: [],
      reminderSent: false,
      startingSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { participants: 5 },
    })

    vi.mocked(db.sessionParticipant.findUnique).mockResolvedValue(null)
    vi.mocked(db.sessionParticipant.create).mockResolvedValue({
      id: 'participant-id',
      sessionId: 'session-1',
      userId: 'patient-id',
      status: 'REGISTERED',
      joinedAt: null,
      leftAt: null,
      createdAt: new Date(),
    })

    const { POST } = await import('@/app/api/sessions/[id]/enroll/route')

    const request = new Request('http://localhost:3000/api/sessions/session-1/enroll', {
      method: 'POST',
    })

    const response = await POST(request, { params: Promise.resolve({ id: 'session-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toContain('inscrito')
  })

  it('should prevent double enrollment', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'patient-id',
        email: 'patient@example.com',
        name: 'Patient',
        role: 'PATIENT',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    vi.mocked(db.groupSession.findUnique).mockResolvedValue({
      id: 'session-1',
      title: 'Test Session',
      description: 'Description',
      category: 'ANXIETY',
      therapistId: 'therapist-profile-id',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 60,
      maxParticipants: 10,
      status: 'SCHEDULED',
      roomName: null,
      roomUrl: null,
      coverImage: null,
      tags: [],
      reminderSent: false,
      startingSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Already enrolled
    vi.mocked(db.sessionParticipant.findUnique).mockResolvedValue({
      id: 'participant-id',
      sessionId: 'session-1',
      userId: 'patient-id',
      status: 'REGISTERED',
      joinedAt: null,
      leftAt: null,
      createdAt: new Date(),
    })

    const { POST } = await import('@/app/api/sessions/[id]/enroll/route')

    const request = new Request('http://localhost:3000/api/sessions/session-1/enroll', {
      method: 'POST',
    })

    const response = await POST(request, { params: Promise.resolve({ id: 'session-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('já está inscrito')
  })
})

