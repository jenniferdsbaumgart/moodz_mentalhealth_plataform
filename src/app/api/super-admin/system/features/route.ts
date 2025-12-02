import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createFlagSchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  enabledFor: z.array(z.string()).default([]),
  betaOnly: z.boolean().default(false),
  rolloutPercentage: z.number().min(0).max(100).default(100),
})

export async function GET() {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const flags = await db.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(flags)
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createFlagSchema.parse(body)

    // Check if key already exists
    const existing = await db.featureFlag.findUnique({
      where: { key: data.key },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Feature flag with this key already exists" },
        { status: 400 }
      )
    }

    const flag = await db.featureFlag.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        enabledFor: data.enabledFor,
        betaOnly: data.betaOnly,
        rolloutPercentage: data.rolloutPercentage,
      },
    })

    // Log the action
    await db.systemLog.create({
      data: {
        level: "INFO",
        source: "api",
        message: `Feature flag "${data.name}" created`,
        metadata: {
          flagId: flag.id,
          key: flag.key,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json(flag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating feature flag:", error)
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    )
  }
}
