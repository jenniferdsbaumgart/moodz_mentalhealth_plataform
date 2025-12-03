import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

interface TestUser {
  email: string
  name: string
  password: string
  role: Role
}

const testUsers: TestUser[] = [
  {
    email: "superadmin@moodz.test",
    name: "Super Admin",
    password: "Super123!",
    role: "SUPER_ADMIN"
  },
  {
    email: "admin@moodz.test",
    name: "Admin User",
    password: "Admin123!",
    role: "ADMIN"
  },
  {
    email: "therapist@moodz.test",
    name: "Dr. Terapeuta Teste",
    password: "Therapist123!",
    role: "THERAPIST"
  },
  {
    email: "patient@moodz.test",
    name: "Paciente Teste",
    password: "Patient123!",
    role: "PATIENT"
  }
]

export async function seedUsers() {
  console.log("👤 Seeding test users...")

  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log(`  ⏭️  User ${userData.email} already exists, skipping...`)
      continue
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        emailVerified: new Date(), // Marcar como verificado para testes
      }
    })

    // Criar perfis específicos baseado no role
    if (userData.role === "PATIENT") {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          points: 100,
          level: 1,
          streak: 0,
          longestStreak: 0,
          moodStreak: 0,
          exerciseStreak: 0,
        }
      })
      console.log(`  ✅ Created PATIENT: ${userData.email} with PatientProfile`)
    } else if (userData.role === "THERAPIST") {
      await prisma.therapistProfile.create({
        data: {
          userId: user.id,
          crp: "CRP-00/00000",
          specialties: ["Ansiedade", "Depressão", "Terapia Cognitivo-Comportamental"],
          bio: "Terapeuta de teste para desenvolvimento da plataforma Moodz.",
          education: "Psicologia - Universidade de Teste",
          experience: "5 anos de experiência em saúde mental",
          isVerified: true,
          verifiedAt: new Date(),
          availableForNew: true,
        }
      })
      console.log(`  ✅ Created THERAPIST: ${userData.email} with TherapistProfile (verified)`)
    } else {
      console.log(`  ✅ Created ${userData.role}: ${userData.email}`)
    }

    // Criar UserProfile básico para todos
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        bio: `Usuário de teste - ${userData.role}`,
      }
    })

    // Criar preferências padrão
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        sessionReminders: true,
        communityNotifications: true,
        profileVisibility: "private",
        theme: "system",
        language: "pt-BR",
      }
    })
  }

  console.log("👤 Test users seeding completed!")
  console.log("")
  console.log("📋 Test accounts created:")
  console.log("┌─────────────────────────────┬─────────────────┬─────────────┐")
  console.log("│ Email                       │ Password        │ Role        │")
  console.log("├─────────────────────────────┼─────────────────┼─────────────┤")
  for (const user of testUsers) {
    const email = user.email.padEnd(27)
    const password = user.password.padEnd(15)
    const role = user.role.padEnd(11)
    console.log(`│ ${email} │ ${password} │ ${role} │`)
  }
  console.log("└─────────────────────────────┴─────────────────┴─────────────┘")
}

// Executar diretamente se chamado como script
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error("❌ Error seeding users:", e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

