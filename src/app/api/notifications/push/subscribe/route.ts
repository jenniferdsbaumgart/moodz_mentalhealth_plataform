import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { registerPushSubscription } from "@/lib/notifications/push"

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
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription data" },
        { status: 400 }
      )
    }

    // Register the subscription
    const success = await registerPushSubscription(session.user.id, subscription)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Push subscription registered successfully"
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to register push subscription" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error registering push subscription:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
