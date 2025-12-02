import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Check database connection and latency
    const dbStart = Date.now()
    let dbConnected = false
    try {
      await db.$queryRaw`SELECT 1`
      dbConnected = true
    } catch {
      dbConnected = false
    }
    const dbLatency = Date.now() - dbStart

    // Check services (simulated for external services)
    const services = [
      {
        name: "Database",
        status: dbConnected ? "online" : "offline" as const,
        latency: dbLatency,
        lastChecked: now.toISOString(),
        details: dbConnected ? "PostgreSQL conectado" : "Falha na conexão",
      },
      {
        name: "Pusher",
        status: await checkPusherStatus(),
        latency: undefined,
        lastChecked: now.toISOString(),
        details: "Real-time messaging",
      },
      {
        name: "Resend",
        status: await checkResendStatus(),
        latency: undefined,
        lastChecked: now.toISOString(),
        details: "Email service",
      },
      {
        name: "Daily",
        status: await checkDailyStatus(),
        latency: undefined,
        lastChecked: now.toISOString(),
        details: "Video conferencing",
      },
    ]

    // Get system stats
    const uptime = process.uptime()
    const memory = process.memoryUsage()

    return NextResponse.json({
      services,
      database: {
        connected: dbConnected,
        latency: dbLatency,
      },
      uptime,
      memory: {
        used: memory.heapUsed,
        total: memory.heapTotal,
      },
    })
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json(
      { error: "Failed to fetch system status" },
      { status: 500 }
    )
  }
}

async function checkPusherStatus(): Promise<"online" | "offline" | "degraded"> {
  // Check if Pusher environment variables are configured
  const hasConfig = !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  )

  if (!hasConfig) return "offline"

  // In production, you could make a test request to Pusher
  // For now, we assume online if configured
  return "online"
}

async function checkResendStatus(): Promise<"online" | "offline" | "degraded"> {
  // Check if Resend API key is configured
  const hasConfig = !!process.env.RESEND_API_KEY

  if (!hasConfig) return "offline"

  // In production, you could make a test request to Resend
  // For now, we assume online if configured
  return "online"
}

async function checkDailyStatus(): Promise<"online" | "offline" | "degraded"> {
  // Check if Daily.co API key is configured
  const hasConfig = !!process.env.DAILY_API_KEY

  if (!hasConfig) return "offline"

  // In production, you could make a test request to Daily.co
  // For now, we assume online if configured
  return "online"
}
