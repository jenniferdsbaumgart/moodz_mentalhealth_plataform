import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    // Validate action
    const validActions = ["PIN", "UNPIN", "LOCK", "UNLOCK"] as const
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      )
    }

    // Get current post
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { isPinned: true, isLocked: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      )
    }

    const updateData: { isPinned?: boolean; isLocked?: boolean } = {}

    switch (action) {
      case "PIN":
        updateData.isPinned = true
        break
      case "UNPIN":
        updateData.isPinned = false
        break
      case "LOCK":
        updateData.isLocked = true
        break
      case "UNLOCK":
        updateData.isLocked = false
        break
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        isPinned: true,
        isLocked: true,
      },
    })

    return NextResponse.json({
      data: updatedPost,
      message: `Post ${action.toLowerCase()} com sucesso`,
    })
  } catch (error) {
    console.error("Error updating post:", error)
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Get post info before deletion (for gamification)
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true, title: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      )
    }

    // Delete post (cascade will handle comments)
    await prisma.post.delete({
      where: { id: params.id },
    })

    // Penalize author for admin-deleted content
    if (post.authorId) {
      await prisma.patientProfile.update({
        where: { userId: post.authorId },
        data: { points: { decrement: 15 } }, // Higher penalty for admin deletion
      })
    }

    return NextResponse.json({
      message: "Post deletado com sucesso",
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
