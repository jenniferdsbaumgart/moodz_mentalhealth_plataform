import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/admin/moderation/log
 * Get moderation action logs
 */
export async function GET(request: NextRequest) {
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

    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const moderatorId = searchParams.get("moderatorId")
    const action = searchParams.get("action")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      action: {
        in: [
          "RESOLVE_REPORT",
          "DISMISS_REPORT",
          "DELETE_POST",
          "DELETE_COMMENT",
          "BAN",
          "SUSPEND",
          "UNBAN",
          "WARN",
          "CHANGE_ROLE",
          "BULK_BAN",
          "BULK_SUSPEND"
        ]
      }
    }

    if (moderatorId) {
      where.userId = moderatorId
    }

    if (action) {
      where.action = action
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.auditLog.count({ where })
    ])

    // Get unique moderators for filter
    const moderators = await db.auditLog.groupBy({
      by: ["userId"],
      where: {
        action: {
          in: [
            "RESOLVE_REPORT",
            "DISMISS_REPORT",
            "DELETE_POST",
            "DELETE_COMMENT",
            "BAN",
            "SUSPEND",
            "WARN"
          ]
        }
      }
    })

    const moderatorIds = moderators.map(m => m.userId)
    const moderatorUsers = await db.user.findMany({
      where: { id: { in: moderatorIds } },
      select: { id: true, name: true }
    })

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      moderators: moderatorUsers
    })
  } catch (error) {
    console.error("Error fetching moderation logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch moderation logs" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/moderation/log
 * Create a moderation log entry (internal use)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const body = await request.json()
    const { action, entityType, entityId, details } = body

    const log = await db.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        entityType,
        entityId,
        details: JSON.stringify(details)
      }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error creating moderation log:", error)
    return NextResponse.json(
      { error: "Failed to create moderation log" },
      { status: 500 }
    )
  }
}

