import { Role, UserStatus } from "@prisma/client"

// Base user types
export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  password: string | null
  role: Role
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

// Extended user types with relations
export interface UserWithProfile extends User {
  profile?: UserProfile | null
  therapistProfile?: TherapistProfile | null
  patientProfile?: PatientProfile | null
  preferences?: UserPreferences | null
  emergencyContacts?: EmergencyContact[]
  goals?: UserGoal[]
  moodLogs?: UserMoodLog[]
}

// Profile types
export interface UserProfile {
  id: string
  userId: string
  bio?: string | null
  avatar?: string | null
  phone?: string | null
  birthDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface TherapistProfile {
  id: string
  userId: string
  crp: string
  specialties: string[]
  bio: string
  education?: string | null
  experience?: string | null
  documentUrl?: string | null
  photoUrl?: string | null
  isVerified: boolean
  verifiedAt?: Date | null
  verifiedBy?: string | null
  rejectionReason?: string | null
  hourlyRate?: number | null
  // Novos campos para perfil avançado
  specializations?: string[]
  languages?: string[]
  sessionPrice?: number | null
  currency?: string
  availableForNew?: boolean
  publicBio?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PatientProfile {
  id: string
  userId: string
  points: number
  level: number
  streak: number
  lastActiveAt?: Date | null
  preferredCategories: string[]
  createdAt: Date
  updatedAt: Date
}

// Related entities
export interface EmergencyContact {
  id: string
  userId: string
  name: string
  phone: string
  email?: string | null
  relation: string
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  sessionReminders: boolean
  communityNotifications: boolean
  profileVisibility: "public" | "private" | "therapists_only"
  showMoodInCommunity: boolean
  theme: "light" | "dark" | "system"
  language: string
  createdAt: Date
  updatedAt: Date
}

export interface UserGoal {
  id: string
  userId: string
  title: string
  description?: string | null
  category: "mental_health" | "wellness" | "social" | "professional"
  priority: "low" | "medium" | "high"
  isCompleted: boolean
  completedAt?: Date | null
  targetDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserMoodLog {
  id: string
  userId: string
  mood: number
  note?: string | null
  activities: string[]
  isPublic: boolean
  createdAt: Date
}

// Utility types
export type UserRole = Role
export type UserStatusType = UserStatus

// Form types (for components)
export interface UserProfileFormData {
  name?: string
  bio?: string
  avatar?: string
  phone?: string
  birthDate?: string
}

export interface TherapistProfileFormData {
  crp?: string
  specialties?: string[]
  bio?: string
  education?: string
  experience?: string
  documentUrl?: string
  photoUrl?: string
  hourlyRate?: number
}

export interface PatientProfileFormData {
  preferredCategories?: string[]
}

// Public therapist profile types
export interface PublicTherapistProfile {
  id: string
  name: string | null
  image: string | null
  therapistProfile: {
    id: string
    crp: string
    specialties: string[]
    specializations: string[]
    languages: string[]
    bio: string
    publicBio: string
    education?: string | null
    experience?: string | null
    photoUrl?: string | null
    isVerified: boolean
    hourlyRate?: number | null
    sessionPrice?: number | null
    currency: string
    availableForNew: boolean
    stats?: {
      totalSessions: number
      totalPatients: number
      avgRating?: number | null
    } | null
    reviews: Array<{
      id: string
      rating: number
      comment?: string | null
      isAnonymous: boolean
      createdAt: Date
      patientName?: string | null
      sessionTitle: string
    }>
    availabilities: Array<{
      id: string
      dayOfWeek: number
      startTime: string
      endTime: string
      isRecurring: boolean
      specificDate?: Date | null
    }>
    upcomingSessions: Array<{
      id: string
      title: string
      description: string
      scheduledAt: Date
      duration: number
      maxParticipants: number
      _count: {
        participants: number
      }
    }>
  }
}

export interface UserPreferencesFormData {
  emailNotifications?: boolean
  pushNotifications?: boolean
  sessionReminders?: boolean
  communityNotifications?: boolean
  profileVisibility?: "public" | "private" | "therapists_only"
  showMoodInCommunity?: boolean
  theme?: "light" | "dark" | "system"
  language?: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}


