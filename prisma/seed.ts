import { PrismaClient } from "@prisma/client"
import { seedExercises } from "./seed-exercises"
import { seedBadges } from "./seed-badges"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  await seedExercises()
  await seedBadges()

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
