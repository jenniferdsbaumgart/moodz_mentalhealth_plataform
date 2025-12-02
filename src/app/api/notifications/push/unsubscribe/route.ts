import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { removePushSubscription } from "@/lib/notifications/push"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: "Endpoint is required" },
        { status: 400 }
      )
    }

    // Remove the subscription
    const success = await removePushSubscription(endpoint)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Push subscription removed successfully"
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to remove push subscription" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error removing push subscription:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

