import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"
/**
 * GET /api/notifications/preferences
 * Get notification preferences for the authenticated user
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
    // Get all preferences for the user
    const preferences = await db.notificationPreference.findMany({
      where: { userId: session.user.id }
    })
    // Create a map for easy lookup
    const preferencesMap: Record<string, { email: boolean; push: boolean; inApp: boolean }> = {}
    // Initialize with defaults for all types
    const allTypes = Object.values(NotificationType)
    for (const type of allTypes) {
      preferencesMap[type] = { email: true, push: true, inApp: true }
    }
    // Override with user preferences
    for (const pref of preferences) {
      preferencesMap[pref.type] = {
        email: pref.email,
        push: pref.push,
        inApp: pref.inApp
      }
    }
    return NextResponse.json({ preferences: preferencesMap })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}
/**
 * PUT /api/notifications/preferences
 * Update notification preferences for the authenticated user
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { preferences } = body
    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      )
    }
    // Upsert each preference
    const updates = []
    for (const [type, settings] of Object.entries(preferences)) {
      if (!Object.values(NotificationType).includes(type as NotificationType)) {
        continue
      }
      const { email, push, inApp } = settings as { email?: boolean; push?: boolean; inApp?: boolean }
      updates.push(
        db.notificationPreference.upsert({
          where: {
            userId_type: {
              userId: session.user.id,
              type: type as NotificationType
            }
          },
          create: {
            userId: session.user.id,
            type: type as NotificationType,
            email: email ?? true,
            push: push ?? true,
            inApp: inApp ?? true
          },
          update: {
            email: email ?? true,
            push: push ?? true,
            inApp: inApp ?? true
          }
        })
      )
    }
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
/**
 * PATCH /api/notifications/preferences
 * Update a single notification preference
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
    const { type, channel, enabled } = body
    if (!type || !channel || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 }
      )
    }
    if (!["email", "push", "inApp"].includes(channel)) {
      return NextResponse.json(
        { error: "Invalid channel" },
        { status: 400 }
      )
    }
    // Upsert the preference
    const updateData: any = {}
    updateData[channel] = enabled
    await db.notificationPreference.upsert({
      where: {
        userId_type: {
          userId: session.user.id,
          type: type as NotificationType
        }
      },
      create: {
        userId: session.user.id,
        type: type as NotificationType,
        email: channel === "email" ? enabled : true,
        push: channel === "push" ? enabled : true,
        inApp: channel === "inApp" ? enabled : true
      },
      update: updateData
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification preference:", error)
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    )
  }
}
