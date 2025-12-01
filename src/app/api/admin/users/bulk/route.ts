import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification, broadcastNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"

/**
 * POST /api/admin/users/bulk
 * Perform bulk actions on multiple users
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { action, userIds, data } = body

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Provide action and userIds array" },
        { status: 400 }
      )
    }

    let result: any = { success: true, affected: 0 }

    switch (action) {
      case "ban":
        // Ban multiple users
        const banResult = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "BANNED" }
        })
        result.affected = banResult.count

        // Send notification to banned users
        await broadcastNotification(userIds, {
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: "Conta suspensa",
          message: "Sua conta foi suspensa por violar os termos de uso da plataforma.",
          data: { link: "/support" }
        })
        break

      case "unban":
        // Unban multiple users
        const unbanResult = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "ACTIVE" }
        })
        result.affected = unbanResult.count
        break

      case "suspend":
        // Temporarily suspend users
        const suspendUntil = data?.suspendUntil 
          ? new Date(data.suspendUntil)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days

        const suspendResult = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { 
            status: "SUSPENDED",
            // Store suspension end date in metadata or separate field
          }
        })
        result.affected = suspendResult.count

        // Notify suspended users
        await broadcastNotification(userIds, {
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: "Conta suspensa temporariamente",
          message: `Sua conta foi suspensa até ${suspendUntil.toLocaleDateString("pt-BR")}. ${data?.reason || ""}`,
          data: { link: "/support" }
        })
        break

      case "notify":
        // Send notification to multiple users
        if (!data?.title || !data?.message) {
          return NextResponse.json(
            { error: "Notification requires title and message" },
            { status: 400 }
          )
        }

        await broadcastNotification(userIds, {
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: data.title,
          message: data.message,
          data: data.link ? { link: data.link } : undefined
        })
        result.affected = userIds.length
        break

      case "changeRole":
        // Change role for multiple users
        if (!data?.role) {
          return NextResponse.json(
            { error: "Role is required" },
            { status: 400 }
          )
        }

        const roleResult = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: data.role }
        })
        result.affected = roleResult.count
        break

      case "delete":
        // Soft delete users (set status to DELETED)
        const deleteResult = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "INACTIVE" }
        })
        result.affected = deleteResult.count
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: `BULK_${action.toUpperCase()}`,
        entityType: "USER",
        entityId: userIds.join(","),
        details: JSON.stringify({ userIds, data, affected: result.affected })
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}
