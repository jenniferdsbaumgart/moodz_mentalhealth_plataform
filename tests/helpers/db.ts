import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use a separate database for tests or mock it
const prisma = new PrismaClient()

export interface TestUser {
  id: string
  email: string
  name: string
  password: string
  role: 'PATIENT' | 'THERAPIST' | 'ADMIN' | 'SUPER_ADMIN'
  emailVerified?: Date | null
}

/**
 * Creates a test user in the database
 */
export async function createTestUser(data: Partial<TestUser> = {}): Promise<TestUser> {
  const hashedPassword = await bcrypt.hash(data.password || 'test123456', 12)
  
  const user = await prisma.user.create({
    data: {
      email: data.email || `test-${Date.now()}@example.com`,
      name: data.name || 'Test User',
      password: hashedPassword,
      role: data.role || 'PATIENT',
      emailVerified: data.emailVerified ?? new Date(),
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name || 'Test User',
    password: data.password || 'test123456',
    role: user.role as TestUser['role'],
    emailVerified: user.emailVerified,
  }
}

/**
 * Creates a test therapist with profile
 */
export async function createTestTherapist(data: Partial<TestUser> = {}) {
  const user = await createTestUser({ ...data, role: 'THERAPIST' })
  
  await prisma.therapistProfile.create({
    data: {
      userId: user.id,
      crp: `CRP-${Date.now()}`,
      specialties: ['Ansiedade', 'Depressão'],
      bio: 'Terapeuta de teste',
      isVerified: true,
      verifiedAt: new Date(),
    },
  })

  return user
}

/**
 * Creates a test patient with profile
 */
export async function createTestPatient(data: Partial<TestUser> = {}) {
  const user = await createTestUser({ ...data, role: 'PATIENT' })
  
  await prisma.patientProfile.create({
    data: {
      userId: user.id,
      points: 0,
      level: 1,
      streak: 0,
    },
  })

  return user
}

/**
 * Creates a verification token for testing
 */
export async function createVerificationToken(email: string, expiresInHours = 24) {
  const token = `test-token-${Date.now()}`
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return { token, expires }
}

/**
 * Creates an expired verification token for testing
 */
export async function createExpiredVerificationToken(email: string) {
  const token = `expired-token-${Date.now()}`
  const expires = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return { token, expires }
}

/**
 * Creates a test session
 */
export async function createTestSession(therapistId: string, data: Record<string, unknown> = {}) {
  const therapistProfile = await prisma.therapistProfile.findUnique({
    where: { userId: therapistId },
  })

  if (!therapistProfile) {
    throw new Error('Therapist profile not found')
  }

  return prisma.groupSession.create({
    data: {
      title: (data.title as string) || 'Test Session',
      description: (data.description as string) || 'Test session description',
      category: (data.category as string) || 'ANXIETY',
      therapistId: therapistProfile.id,
      scheduledAt: (data.scheduledAt as Date) || new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: (data.duration as number) || 60,
      maxParticipants: (data.maxParticipants as number) || 10,
      status: (data.status as string) || 'SCHEDULED',
    },
  })
}

/**
 * Cleans up test data
 */
export async function cleanupTestData(emails: string[]) {
  // Delete in correct order due to foreign keys
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Delete related records first
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })
      await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${email}` } })
      await prisma.therapistProfile.deleteMany({ where: { userId: user.id } })
      await prisma.patientProfile.deleteMany({ where: { userId: user.id } })
      await prisma.user.delete({ where: { id: user.id } })
    }
  }
}

/**
 * Cleans up all test data (use with caution!)
 */
export async function cleanupAllTestData() {
  // Only clean emails that look like test emails
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test-' } },
        { email: { contains: '@example.com' } },
      ],
    },
  })

  await cleanupTestData(testUsers.map(u => u.email))
}

export { prisma }

