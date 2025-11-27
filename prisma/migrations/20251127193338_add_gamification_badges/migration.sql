-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('MOOD_TRACKING', 'JOURNALING', 'MINDFULNESS', 'STREAKS', 'ACHIEVEMENT');

-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "exerciseStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "moodStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "requirement" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientBadge" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PatientBadge_patientId_badgeId_key" ON "PatientBadge"("patientId", "badgeId");

-- AddForeignKey
ALTER TABLE "PatientBadge" ADD CONSTRAINT "PatientBadge_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientBadge" ADD CONSTRAINT "PatientBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
