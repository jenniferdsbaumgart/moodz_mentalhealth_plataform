import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") // Single type
    const types = searchParams.get("types") // Multiple types (comma-separated)
    const read = searchParams.get("read")

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.NotificationWhereInput = {
      userId: session.user.id
    }

    // Support both single type and multiple types
    if (types) {
      const typeArray = types.split(",").map(t => t.trim()).filter(Boolean)
      if (typeArray.length > 0) {
        where.type = { in: typeArray as any }
      }
    } else if (type) {
      where.type = type as any
    }

    // Filter by read status
    if (read !== null && read !== undefined && read !== "") {
      where.read = read === "true"
    }

    // Fetch notifications with pagination
    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: {
          userId: session.user.id,
          read: false
        }
      })
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications for the authenticated user
 * Supports ?read=true to delete only read notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const readOnly = searchParams.get("read") === "true"

    const where: Prisma.NotificationWhereInput = {
      userId: session.user.id
    }

    // If read=true, only delete read notifications
    if (readOnly) {
      where.read = true
    }

    const result = await db.notification.deleteMany({ where })

    return NextResponse.json({ 
      success: true,
      deleted: result.count
    })
  } catch (error) {
    console.error("Error deleting notifications:", error)
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    )
  }
}
