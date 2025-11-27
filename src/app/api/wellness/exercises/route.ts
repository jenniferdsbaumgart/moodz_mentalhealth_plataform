import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ExerciseCategory, Difficulty } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as ExerciseCategory | null
    const difficulty = searchParams.get("difficulty") as Difficulty | null
    const featured = searchParams.get("featured") === "true"
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50)

    // Build where clause
    const where: {
      isActive: boolean
      category?: ExerciseCategory
      difficulty?: Difficulty
      isFeatured?: boolean
      OR?: Array<{
        title?: { contains: string; mode: string }
        description?: { contains: string; mode: string }
      }>
    } = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (featured) {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const skip = (page - 1) * limit

    // Get exercises
    const [exercises, total] = await Promise.all([
      prisma.mindfulnessExercise.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { title: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.mindfulnessExercise.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: exercises,
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
    console.error("Error fetching exercises:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
