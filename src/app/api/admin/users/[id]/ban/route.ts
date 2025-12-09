import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { reason } = await request.json()

    // Validate inputs
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Motivo do banimento é obrigatório (mínimo 10 caracteres)" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const { id } = await params
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Cannot ban admins or super admins
    if (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Não é possível banir administradores" },
        { status: 403 }
      )
    }

    // Cannot ban yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível banir a si mesmo" },
        { status: 400 }
      )
    }

    // Update user status to banned
    await prisma.user.update({
      where: { id },
      data: {
        status: "BANNED",
        updatedAt: new Date(),
      },
    })

    // Delete all user's content
    await Promise.all([
      prisma.post.deleteMany({
        where: { authorId: id },
      }),
      prisma.comment.deleteMany({
        where: { authorId: id },
      }),
      prisma.vote.deleteMany({
        where: { userId: id },
      }),
    ])

    // Reset user's points (gamification penalty)
    await prisma.patientProfile.update({
      where: { userId: id },
      data: { points: 0 },
    })

    // Log the ban action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "USER_BANNED",
        entity: "USER",
        entityId: id,
        details: { reason }
      }
    })

    return NextResponse.json({
      message: `Usuário ${targetUser.name || targetUser.email} foi banido com sucesso`,
      data: {
        userId: id,
        reason,
        bannedAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Error banning user:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Unban user
    await prisma.user.update({
      where: { id },
      data: {
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    })

    // Log the unban action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "USER_UNBANNED",
        entity: "USER",
        entityId: id,
      }
    })

    return NextResponse.json({
      message: "Usuário desbanido com sucesso",
    })
  } catch (error) {
    console.error("Error unbanning user:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
