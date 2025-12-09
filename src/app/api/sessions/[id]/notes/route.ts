import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify session exists and user is the therapist
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: { therapistId: true }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.therapistId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Get notes for this session
    const notes = await prisma.sessionNote.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ data: notes })

  } catch (error) {
    console.error("Error fetching session notes:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { content, isPrivate } = await request.json()

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Conteúdo da nota é obrigatório" },
        { status: 400 }
      )
    }

    // Verify session exists and user is the therapist
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: { therapistId: true }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.therapistId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Create note
    const note = await prisma.sessionNote.create({
      data: {
        sessionId: id,
        therapistId: session.user.id,
        content: content.trim(),
        isPrivate: isPrivate ?? true
      }
    })

    return NextResponse.json({ data: note }, { status: 201 })

  } catch (error) {
    console.error("Error creating session note:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { content, isPrivate } = await request.json()

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Conteúdo da nota é obrigatório" },
        { status: 400 }
      )
    }

    // Verify session exists and user is the therapist
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: { therapistId: true }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    if (groupSession.therapistId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Get the existing note (assuming only one note per session for simplicity)
    const existingNote = await prisma.sessionNote.findFirst({
      where: { sessionId: id }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      )
    }

    // Update note
    const updatedNote = await prisma.sessionNote.update({
      where: { id: existingNote.id },
      data: {
        content: content.trim(),
        isPrivate: isPrivate ?? existingNote.isPrivate,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ data: updatedNote })

  } catch (error) {
    console.error("Error updating session note:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}



