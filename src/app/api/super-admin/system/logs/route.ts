import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LogLevel, Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")
    const source = searchParams.get("source")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Prisma.SystemLogWhereInput = {}

    if (level && level !== "all") {
      where.level = level.toLowerCase() as any
    }

    if (source && source !== "all") {
      where.source = source
    }

    if (search) {
      where.message = {
        contains: search,
        mode: "insensitive",
      }
    }

    const [logs, total] = await Promise.all([
      db.systemLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.systemLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch system logs" },
      { status: 500 }
    )
  }
}

// Helper to create system logs from other parts of the app
export async function POST(request: Request) {
  try {
    const session = await auth()

    // Allow internal services or super admins
    const authHeader = request.headers.get("authorization")
    const isInternalService = authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isInternalService && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const log = await db.systemLog.create({
      data: {
        level: body.level || "info",
        source: body.source,
        message: body.message,
        metadata: body.metadata,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error("Error creating system log:", error)
    return NextResponse.json(
      { error: "Failed to create system log" },
      { status: 500 }
    )
  }
}
