import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * POST /api/notifications/[id]/read
 * Mark a specific notification as read
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the notification belongs to the user
    const existingNotification = await db.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // If already read, just return success
    if (existingNotification.read) {
      return NextResponse.json({
        success: true,
        notification: existingNotification
      })
    }

    // Mark as read
    const notification = await db.notification.update({
      where: { id: params.id },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

