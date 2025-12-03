import { PrismaClient } from "@prisma/client"
import { seedExercises } from "./seed-exercises"
import { seedBadges } from "./seed-badges"
import { seedBlogCategories } from "./seed-blog-categories"
import { seedNotificationPreferences } from "./seed-notification-preferences"
import { seedUsers } from "./seed-users"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Seed usuários de teste primeiro
  await seedUsers()
  
  // Seed dados de referência
  await seedExercises()
  await seedBadges()
  await seedBlogCategories()
  await seedNotificationPreferences()

  console.log("✅ Database seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
