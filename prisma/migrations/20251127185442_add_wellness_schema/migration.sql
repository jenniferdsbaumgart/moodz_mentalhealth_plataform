-- CreateEnum
CREATE TYPE "PromptCategory" AS ENUM ('GRATITUDE', 'REFLECTION', 'GOALS', 'EMOTIONS', 'RELATIONSHIPS', 'GROWTH', 'CHALLENGES', 'CREATIVITY');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('BREATHING', 'MEDITATION', 'BODY_SCAN', 'GROUNDING', 'VISUALIZATION', 'RELAXATION', 'MINDFUL_MOVEMENT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "energy" INTEGER,
    "anxiety" INTEGER,
    "sleep" INTEGER,
    "emotions" TEXT[],
    "activities" TEXT[],
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mood" INTEGER,
    "promptId" TEXT,
    "tags" TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalPrompt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" "PromptCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JournalPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindfulnessExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "instructions" TEXT[],
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "benefits" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MindfulnessExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseCompletion" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoodEntry_patientId_date_idx" ON "MoodEntry"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodEntry_patientId_date_key" ON "MoodEntry"("patientId", "date");

-- CreateIndex
CREATE INDEX "JournalEntry_patientId_createdAt_idx" ON "JournalEntry"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_isPrivate_idx" ON "JournalEntry"("isPrivate");

-- CreateIndex
CREATE INDEX "JournalPrompt_category_isActive_idx" ON "JournalPrompt"("category", "isActive");

-- CreateIndex
CREATE INDEX "MindfulnessExercise_category_isActive_idx" ON "MindfulnessExercise"("category", "isActive");

-- CreateIndex
CREATE INDEX "MindfulnessExercise_difficulty_idx" ON "MindfulnessExercise"("difficulty");

-- CreateIndex
CREATE INDEX "MindfulnessExercise_isFeatured_idx" ON "MindfulnessExercise"("isFeatured");

-- CreateIndex
CREATE INDEX "ExerciseCompletion_patientId_completedAt_idx" ON "ExerciseCompletion"("patientId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCompletion_patientId_exerciseId_completedAt_key" ON "ExerciseCompletion"("patientId", "exerciseId", "completedAt");

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "JournalPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCompletion" ADD CONSTRAINT "ExerciseCompletion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseCompletion" ADD CONSTRAINT "ExerciseCompletion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "MindfulnessExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
