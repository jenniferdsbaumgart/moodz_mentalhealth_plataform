import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { moodEntrySchema } from "@/lib/validations/mood"
import { GamificationService } from "@/lib/gamification"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100)

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Build where clause
    const where: {
      patientId: string
      date?: { gte?: Date; lte?: Date }
    } = {
      patientId: patient.id,
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      }
    }

    const skip = (page - 1) * limit

    // Get mood entries
    const [entries, total] = await Promise.all([
      prisma.moodEntry.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.moodEntry.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = moodEntrySchema.parse(body)

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Check if entry already exists for this date
    const existingEntry = await prisma.moodEntry.findUnique({
      where: {
        patientId_date: {
          patientId: patient.id,
          date: validatedData.date ? new Date(validatedData.date) : new Date(),
        },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: "Já existe uma entrada de humor para esta data" },
        { status: 400 }
      )
    }

    // Create mood entry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        patientId: patient.id,
        mood: validatedData.mood,
        energy: validatedData.energy,
        anxiety: validatedData.anxiety,
        sleep: validatedData.sleep,
        emotions: validatedData.emotions,
        activities: validatedData.activities,
        notes: validatedData.notes,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      },
    })

    // Award points and check badges using gamification service
    const gamificationResult = await GamificationService.awardMoodEntryPoints(patient.id)

    return NextResponse.json(
      {
        data: moodEntry,
        message: "Entrada de humor registrada com sucesso!",
        gamification: gamificationResult
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating mood entry:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
