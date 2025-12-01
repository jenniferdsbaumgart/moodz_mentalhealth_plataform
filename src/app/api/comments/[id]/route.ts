import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateCommentSchema } from "@/lib/validations/community"

export async function PATCH(
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

    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    // Verify comment exists and user is author
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { authorId: true, postId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      )
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        content: validatedData.content,
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    })

    return NextResponse.json({ data: updatedComment })
  } catch (error) {
    console.error("Error updating comment:", error)
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

export async function DELETE(
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

    // Verify comment exists and user is author
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { authorId: true, postId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      )
    }

    // Check if user is author or admin/super-admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    const isAuthor = comment.authorId === session.user.id
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Delete comment (cascade will handle replies)
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Comentário deletado com sucesso" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


