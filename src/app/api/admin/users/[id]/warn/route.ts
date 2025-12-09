import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"
/**
 * POST /api/admin/users/[id]/warn
 * Send a warning to a user without banning
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Check if user is admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id: userId } = await params
    const body = await request.json()
    const { reason, message, reportId } = body
    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      )
    }
    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    // Create warning notification
    await createNotification({
      userId: userId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: "⚠️ Aviso da Moderação",
      message: message || `Você recebeu um aviso por: ${reason}. Por favor, revise as regras da comunidade.`,
      data: { link: "/community/rules", warningReason: reason }
    })
    // Log the warning
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "USER_UPDATED",
        entity: "USER",
        entityId: userId,
        details: {
          reason,
          message,
          reportId,
          userName: user.name,
          userEmail: user.email
        }
      }
    })
    // If this is related to a report, update the report
    if (reportId) {
      await db.report.update({
        where: { id: reportId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date()
        }
      })
    }
    // Get warning count for this user
    const warningCount = await db.auditLog.count({
      where: {
        action: "USER_UPDATED",
        entity: "USER",
        entityId: userId
      }
    })
    return NextResponse.json({
      success: true,
      warningCount,
      message: "Warning sent successfully"
    })
  } catch (error) {
    console.error("Error sending warning:", error)
    return NextResponse.json(
      { error: "Failed to send warning" },
      { status: 500 }
    )
  }
}
/**
 * GET /api/admin/users/[id]/warn
 * Get warning history for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id: userId } = await params
    const warnings = await db.auditLog.findMany({
      where: {
        action: "USER_UPDATED",
        entity: "USER",
        entityId: userId
      },
      select: {
        id: true,
        details: true,
        createdAt: true,
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({
      warnings: warnings.map(w => ({
        id: w.id,
        ...(w.details as object || {}),
        moderator: w.user.name,
        createdAt: w.createdAt
      })),
      count: warnings.length
    })
  } catch (error) {
    console.error("Error fetching warnings:", error)
    return NextResponse.json(
      { error: "Failed to fetch warnings" },
      { status: 500 }
    )
  }
}
