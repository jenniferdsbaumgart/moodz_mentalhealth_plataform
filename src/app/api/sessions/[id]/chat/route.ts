import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Verify user has access to this session (is therapist or enrolled)
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: {
        therapistId: true,
        participants: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Check if user is therapist or enrolled in session
    const isTherapist = groupSession.therapistId === session.user.id
    const isEnrolled = groupSession.participants.length > 0

    if (!isTherapist && !isEnrolled) {
      return NextResponse.json(
        { error: "Acesso negado - você não está inscrito nesta sessão" },
        { status: 403 }
      )
    }

    // Get chat messages for this session
    const messages = await prisma.sessionChatMessage.findMany({
      where: { sessionId: id },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      sessionId: message.sessionId,
      userId: message.userId,
      userName: message.user.name || "Usuário Anônimo",
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isDeleted: message.isDeleted
    }))

    return NextResponse.json({ data: formattedMessages })

  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await auth()
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
    const { content } = await request.json()

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Conteúdo da mensagem é obrigatório" },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Mensagem muito longa (máximo 1000 caracteres)" },
        { status: 400 }
      )
    }

    // Verify user has access to this session (is therapist or enrolled)
    const groupSession = await prisma.groupSession.findUnique({
      where: { id },
      select: {
        therapistId: true,
        participants: {
          where: { userId: authSession.user.id },
          select: { id: true }
        }
      }
    })

    if (!groupSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Check if user is therapist or enrolled in session
    const isTherapist = groupSession.therapistId === authSession.user.id
    const isEnrolled = groupSession.participants.length > 0

    if (!isTherapist && !isEnrolled) {
      return NextResponse.json(
        { error: "Acesso negado - você não está inscrito nesta sessão" },
        { status: 403 }
      )
    }

    // Get user info for the message
    const user = await prisma.user.findUnique({
      where: { id: authSession.user.id },
      select: { name: true, image: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Create message in database
    const message = await prisma.sessionChatMessage.create({
      data: {
        sessionId: id,
        userId: authSession.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    // Format message for real-time broadcast
    const formattedMessage = {
      id: message.id,
      sessionId: message.sessionId,
      userId: message.userId,
      userName: user.name || "Usuário Anônimo",
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isDeleted: false
    }

    // Broadcast message via Pusher
    try {
      await pusherServer.trigger(
        `session-${id}`,
        'chat-message',
        formattedMessage
      )
    } catch (pusherError) {
      console.error('Pusher broadcast error:', pusherError)
      // Continue anyway - message was saved to DB
    }

    return NextResponse.json({ data: formattedMessage }, { status: 201 })

  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await auth()
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      )
    }

    // Verify session exists and user is therapist
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

    if (groupSession.therapistId !== authSession.user.id) {
      return NextResponse.json(
        { error: "Acesso negado - apenas terapeutas podem deletar mensagens" },
        { status: 403 }
      )
    }

    // Find and delete the message
    const message = await prisma.sessionChatMessage.findUnique({
      where: { id: messageId },
      select: { sessionId: true }
    })

    if (!message || message.sessionId !== id) {
      return NextResponse.json(
        { error: "Mensagem não encontrada nesta sessão" },
        { status: 404 }
      )
    }

    // Soft delete the message
    const deletedMessage = await prisma.sessionChatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedBy: authSession.user.id
      }
    })

    // Broadcast deletion via Pusher
    try {
      await pusherServer.trigger(
        `session-${id}`,
        'message-deleted',
        { messageId }
      )
    } catch (pusherError) {
      console.error('Pusher broadcast error:', pusherError)
      // Continue anyway - message was deleted from DB
    }

    return NextResponse.json({
      data: {
        messageId,
        deleted: true
      }
    })

  } catch (error) {
    console.error("Error deleting chat message:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
