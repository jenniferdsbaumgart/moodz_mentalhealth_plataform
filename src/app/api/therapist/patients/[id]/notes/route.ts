import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

// Mock storage para notas do paciente (em produção, seria uma tabela PatientNote)
let mockPatientNotes: Array<{
  id: string
  therapistId: string
  patientId: string
  content: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}> = []

// GET - Listar notas do paciente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = params

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

    // Verificar se o paciente existe e tem relação com o terapeuta
    const hasAccess = await prisma.sessionParticipant.findFirst({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
    })

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "Acesso negado a notas deste paciente" },
        { status: 403 }
      )
    }

    // Filtrar notas do terapeuta para este paciente (mock)
    const patientNotes = mockPatientNotes
      .filter(note => note.therapistId === therapistProfile.id && note.patientId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      data: patientNotes,
    })
  } catch (error) {
    console.error("Erro ao buscar notas do paciente:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Criar nova nota
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { content, isPrivate } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Conteúdo da nota é obrigatório" },
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

    // Verificar se o paciente existe e tem relação com o terapeuta
    const hasAccess = await prisma.sessionParticipant.findFirst({
      where: {
        userId: id,
        session: {
          therapistId: therapistProfile.id,
        },
      },
    })

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: "Acesso negado a este paciente" },
        { status: 403 }
      )
    }

    // Criar nota (mock)
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      therapistId: therapistProfile.id,
      patientId: id,
      content: content.trim(),
      isPrivate: isPrivate || true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockPatientNotes.push(newNote)

    return NextResponse.json({
      success: true,
      data: newNote,
      message: "Nota criada com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar nota:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
