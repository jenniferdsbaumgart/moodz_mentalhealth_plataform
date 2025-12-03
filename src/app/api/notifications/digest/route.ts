import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NotificationDigest } from "@prisma/client"
/**
 * GET /api/notifications/digest
 * Get the current user's notification digest preference
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { notificationDigest: true }
    })
    return NextResponse.json({
      digest: user?.notificationDigest || "IMMEDIATE"
    })
  } catch (error) {
    console.error("Error fetching digest preference:", error)
    return NextResponse.json(
      { error: "Failed to fetch digest preference" },
      { status: 500 }
    )
  }
}
/**
 * PATCH /api/notifications/digest
 * Update the current user's notification digest preference
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { digest } = body
    // Validate digest value
    if (!digest || !Object.values(NotificationDigest).includes(digest)) {
      return NextResponse.json(
        { error: "Invalid digest value. Must be IMMEDIATE, DAILY, or WEEKLY" },
        { status: 400 }
      )
    }
    // Update user's digest preference
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { notificationDigest: digest },
      select: { notificationDigest: true }
    })
    return NextResponse.json({
      success: true,
      digest: updatedUser.notificationDigest
    })
  } catch (error) {
    console.error("Error updating digest preference:", error)
    return NextResponse.json(
      { error: "Failed to update digest preference" },
      { status: 500 }
    )
  }
}
