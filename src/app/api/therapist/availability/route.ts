import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
import { z } from "zod"
const createAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
})
// GET - Listar disponibilidade do terapeuta
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    // Buscar perfil do terapeuta para obter o therapistProfileId
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })
    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil de terapeuta não encontrado" },
        { status: 404 }
      )
    }
    // Buscar availability
    const availability = await prisma.therapistAvailability.findMany({
      where: {
        therapistId: therapistProfile.id,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    })
    return NextResponse.json({
      success: true,
      data: availability,
    })
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// POST - Criar novo slot de disponibilidade
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const body = await request.json()
    const validatedData = createAvailabilitySchema.parse(body)
    // Verificar se horário de início é anterior ao fim
    if (validatedData.startTime >= validatedData.endTime) {
      return NextResponse.json(
        { success: false, message: "Horário de início deve ser anterior ao horário de fim" },
        { status: 400 }
      )
    }
    // Buscar perfil do terapeuta
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })
    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil de terapeuta não encontrado" },
        { status: 404 }
      )
    }
    // Verificar se já existe um slot conflitante no mesmo dia
    const conflictingSlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: therapistProfile.id,
        dayOfWeek: validatedData.dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } },
            ],
          },
        ],
      },
    })
    if (conflictingSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe um horário conflitante neste dia"
        },
        { status: 409 }
      )
    }
    // Criar novo slot
    const newAvailability = await prisma.therapistAvailability.create({
      data: {
        therapistId: therapistProfile.id,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        isRecurring: true,
      },
    })
    return NextResponse.json({
      success: true,
      data: newAvailability,
      message: "Horário adicionado com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar disponibilidade:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
