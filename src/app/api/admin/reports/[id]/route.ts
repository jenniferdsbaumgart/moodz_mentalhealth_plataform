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

    const { action, resolution } = await request.json()

    // Validate action
    const validActions = ["DISMISS", "RESOLVE", "REMOVE_CONTENT", "BAN_USER"] as const
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      )
    }

    // Get report with related content
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            authorId: true,
            postId: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Relatório não encontrado" },
        { status: 404 }
      )
    }

    if (report.status !== "PENDING" && report.status !== "REVIEWING") {
      return NextResponse.json(
        { error: "Este relatório já foi resolvido" },
        { status: 400 }
      )
    }

    const contentAuthorId = report.post?.authorId || report.comment?.authorId

    // Handle different actions
    switch (action) {
      case "DISMISS":
        // Just mark as dismissed
        await prisma.report.update({
          where: { id: params.id },
          data: {
            status: "DISMISSED",
            resolvedAt: new Date(),
            resolvedBy: session.user.id,
            resolution: resolution || "Relatório dispensado - conteúdo considerado apropriado",
          },
        })
        break

      case "RESOLVE":
        // Mark as resolved without taking action
        await prisma.report.update({
          where: { id: params.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            resolvedBy: session.user.id,
            resolution: resolution || "Relatório resolvido",
          },
        })
        break

      case "REMOVE_CONTENT":
        // Delete the reported content
        if (report.postId) {
          await prisma.post.delete({
            where: { id: report.postId },
          })
        } else if (report.commentId) {
          await prisma.comment.delete({
            where: { id: report.commentId },
          })
        }

        // Mark report as resolved
        await prisma.report.update({
          where: { id: params.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            resolvedBy: session.user.id,
            resolution: resolution || "Conteúdo removido conforme denúncia",
          },
        })

        // Deduct points from content author (gamification penalty)
        if (contentAuthorId) {
          await prisma.patientProfile.update({
            where: { userId: contentAuthorId },
            data: { points: { decrement: 10 } }, // Penalty for removed content
          })
        }
        break

      case "BAN_USER":
        // Ban the content author
        if (contentAuthorId) {
          await prisma.user.update({
            where: { id: contentAuthorId },
            data: {
              status: "BANNED",
              updatedAt: new Date(),
            },
          })
        }

        // Delete all their content (optional - could be configurable)
        if (report.postId) {
          await prisma.post.deleteMany({
            where: { authorId: contentAuthorId },
          })
        }

        await prisma.comment.deleteMany({
          where: { authorId: contentAuthorId },
        })

        // Mark report as resolved
        await prisma.report.update({
          where: { id: params.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            resolvedBy: session.user.id,
            resolution: resolution || "Usuário banido e conteúdo removido",
          },
        })
        break
    }

    return NextResponse.json({
      message: "Relatório processado com sucesso",
    })
  } catch (error) {
    console.error("Error processing report:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
