import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateFlagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  enabledFor: z.array(z.string()).optional(),
  betaOnly: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const flag = await db.featureFlag.findUnique({
      where: { id },
    })

    if (!flag) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(flag)
  } catch (error) {
    console.error("Error fetching feature flag:", error)
    return NextResponse.json(
      { error: "Failed to fetch feature flag" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateFlagSchema.parse(body)

    const existing = await db.featureFlag.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      )
    }

    const flag = await db.featureFlag.update({
      where: { id },
      data,
    })

    // Log the action
    await db.systemLog.create({
      data: {
        level: "info",
        source: "api",
        message: `Feature flag "${flag.name}" updated`,
        metadata: {
          flagId: flag.id,
          key: flag.key,
          changes: data,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json(flag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating feature flag:", error)
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.featureFlag.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      )
    }

    await db.featureFlag.delete({
      where: { id },
    })

    // Log the action
    await db.systemLog.create({
      data: {
        level: "info",
        source: "api",
        message: `Feature flag "${existing.name}" deleted`,
        metadata: {
          flagId: existing.id,
          key: existing.key,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feature flag:", error)
    return NextResponse.json(
      { error: "Failed to delete feature flag" },
      { status: 500 }
    )
  }
}
