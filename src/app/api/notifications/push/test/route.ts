import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendPushNotification } from "@/lib/notifications/push"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Send a test push notification
    await sendPushNotification(
      session.user.id,
      "Test Notification",
      "This is a test push notification from Moodz!",
      {
        link: "/notifications",
        test: true
      }
    )

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully"
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send test notification" },
      { status: 500 }
    )
  }
}

