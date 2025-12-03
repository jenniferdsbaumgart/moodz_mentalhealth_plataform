import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }
    // Check if user has any active push subscriptions
    const subscriptionCount = await db.pushSubscription.count({
      where: { userId: session.user.id }
    })
    return NextResponse.json({
      success: true,
      subscribed: subscriptionCount > 0,
      subscriptionCount
    })
  } catch (error) {
    console.error("Error checking push subscription status:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
