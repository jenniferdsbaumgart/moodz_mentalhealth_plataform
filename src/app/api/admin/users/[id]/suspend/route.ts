import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"

/**
 * POST /api/admin/users/[id]/suspend
 * Suspend a user temporarily or permanently
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { type, duration, reason } = body

    // Validate type
    if (!type || !["suspend", "ban", "unban"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be suspend, ban, or unban" },
        { status: 400 }
      )
    }

    // Prevent admin from suspending themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot suspend yourself" },
        { status: 400 }
      )
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { status: true, name: true, email: true, role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent suspending other admins
    if (currentUser.role === "ADMIN" && type !== "unban") {
      return NextResponse.json(
        { error: "Cannot suspend another admin" },
        { status: 400 }
      )
    }

    let newStatus: string
    let suspendUntil: Date | null = null
    let notificationTitle: string
    let notificationMessage: string

    switch (type) {
      case "suspend":
        // Temporary suspension
        const days = duration || 7
        suspendUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        newStatus = "SUSPENDED"
        notificationTitle = "Conta suspensa temporariamente"
        notificationMessage = `Sua conta foi suspensa até ${suspendUntil.toLocaleDateString("pt-BR")}.${reason ? ` Motivo: ${reason}` : ""}`
        break

      case "ban":
        // Permanent ban
        newStatus = "BANNED"
        notificationTitle = "Conta banida"
        notificationMessage = `Sua conta foi banida permanentemente.${reason ? ` Motivo: ${reason}` : ""}`
        break

      case "unban":
        // Remove suspension/ban
        newStatus = "ACTIVE"
        notificationTitle = "Conta reativada"
        notificationMessage = "Sua conta foi reativada. Bem-vindo de volta!"
        break

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Update user status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: type.toUpperCase(),
        entityType: "USER",
        entityId: userId,
        details: JSON.stringify({
          previousStatus: currentUser.status,
          newStatus,
          suspendUntil,
          reason: reason || null,
          duration: type === "suspend" ? duration : null
        })
      }
    })

    // Notify user
    await createNotification({
      userId: userId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: notificationTitle,
      message: notificationMessage,
      data: { link: "/support" }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      suspendUntil,
      action: type
    })
  } catch (error) {
    console.error("Error suspending user:", error)
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]/suspend
 * Remove suspension from a user (alias for unban)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect to POST with type=unban
  const newRequest = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ type: "unban" })
  })

  return POST(newRequest as NextRequest, { params })
}
