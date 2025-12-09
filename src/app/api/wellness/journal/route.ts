import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { createJournalSchema } from "@/lib/validations/journal"
import { GamificationService } from "@/lib/gamification"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const favorite = searchParams.get("favorite") === "true"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

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
      title?: { contains: string; mode: Prisma.QueryMode }
      content?: { contains: string; mode: Prisma.QueryMode }
      OR?: Array<{
        title?: { contains: string; mode: Prisma.QueryMode }
        content?: { contains: string; mode: Prisma.QueryMode }
      }>
      tags?: { has: string }
      isFavorite?: boolean
    } = {
      patientId: patient.id,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (favorite) {
      where.isFavorite = true
    }

    const skip = (page - 1) * limit

    // Get journal entries
    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          prompt: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
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
    console.error("Error fetching journal entries:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createJournalSchema.parse(body)

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

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        patientId: patient.id,
        title: validatedData.title,
        content: validatedData.content,
        mood: validatedData.mood,
        promptId: validatedData.promptId,
        tags: validatedData.tags || [],
        isPrivate: validatedData.isPrivate,
        isFavorite: validatedData.isFavorite,
      },
      include: {
        prompt: true,
      },
    })

    // Award points and check badges using gamification service
    const gamificationResult = await GamificationService.awardJournalEntryPoints(patient.id, validatedData.content)

    return NextResponse.json(
      {
        data: journalEntry,
        message: "Entrada do diário criada com sucesso!",
        gamification: gamificationResult
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating journal entry:", error)
    if ((error as any).name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
