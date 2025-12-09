import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
import { z } from "zod"
const blockDateSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data inválida",
  }),
  reason: z.string().optional(),
})
// Mock storage para blocked dates (em produção, seria uma tabela no banco)
let mockBlockedDates: Array<{
  id: string
  therapistId: string
  date: Date
  reason?: string
  createdAt: Date
}> = []
// GET - Listar datas bloqueadas
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
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
    // Filtrar blocked dates do terapeuta (mock)
    const therapistBlockedDates = mockBlockedDates
      .filter(block => block.therapistId === therapistProfile.id)
      .map(block => ({
        id: block.id,
        date: block.date,
        reason: block.reason,
        createdAt: block.createdAt,
      }))
    return NextResponse.json({
      success: true,
      data: therapistBlockedDates,
    })
  } catch (error) {
    console.error("Erro ao buscar datas bloqueadas:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// POST - Bloquear uma data
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
    const validatedData = blockDateSchema.parse(body)
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
    const blockDate = new Date(validatedData.date)
    // Verificar se a data já está bloqueada
    const existingBlock = mockBlockedDates.find(
      block =>
        block.therapistId === therapistProfile.id &&
        block.date.toDateString() === blockDate.toDateString()
    )
    if (existingBlock) {
      return NextResponse.json(
        { success: false, message: "Esta data já está bloqueada" },
        { status: 409 }
      )
    }
    // Verificar se a data é no passado
    if (blockDate < new Date()) {
      return NextResponse.json(
        { success: false, message: "Não é possível bloquear datas no passado" },
        { status: 400 }
      )
    }
    // Criar bloqueio (mock)
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      therapistId: therapistProfile.id,
      date: blockDate,
      reason: validatedData.reason,
      createdAt: new Date(),
    }
    mockBlockedDates.push(newBlock)
    return NextResponse.json({
      success: true,
      data: {
        id: newBlock.id,
        date: newBlock.date,
        reason: newBlock.reason,
        createdAt: newBlock.createdAt,
      },
      message: "Data bloqueada com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao bloquear data:", error)
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
