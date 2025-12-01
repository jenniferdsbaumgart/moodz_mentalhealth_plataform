import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db as prisma } from "@/lib/db"

// PATCH - Editar nota
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id, noteId } = params
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

    // Importar mock storage (em produção seria do banco)
    const { mockPatientNotes } = require("../route")

    // Encontrar e atualizar a nota
    const noteIndex = mockPatientNotes.findIndex(
      note => note.id === noteId && note.therapistId === therapistProfile.id && note.patientId === id
    )

    if (noteIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Nota não encontrada" },
        { status: 404 }
      )
    }

    // Atualizar nota
    mockPatientNotes[noteIndex] = {
      ...mockPatientNotes[noteIndex],
      content: content.trim(),
      isPrivate: isPrivate ?? mockPatientNotes[noteIndex].isPrivate,
      updatedAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      data: mockPatientNotes[noteIndex],
      message: "Nota atualizada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar nota:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar nota
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id, noteId } = params

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

    // Importar mock storage (em produção seria do banco)
    const { mockPatientNotes } = require("../route")

    // Encontrar e remover a nota
    const noteIndex = mockPatientNotes.findIndex(
      note => note.id === noteId && note.therapistId === therapistProfile.id && note.patientId === id
    )

    if (noteIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Nota não encontrada" },
        { status: 404 }
      )
    }

    // Remover nota
    const deletedNote = mockPatientNotes.splice(noteIndex, 1)[0]

    return NextResponse.json({
      success: true,
      message: "Nota removida com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover nota:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
