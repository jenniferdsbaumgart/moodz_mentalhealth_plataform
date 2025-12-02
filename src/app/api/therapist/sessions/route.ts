import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const therapistId = session.user.id

  let where: any = { therapistId }

  if (start && end) {
    where.scheduledAt = {
      gte: new Date(start),
      lte: new Date(end)
    }
  }

  const sessions = await db.groupSession.findMany({
    where,
    include: {
      _count: { select: { participants: true } }
    },
    orderBy: { scheduledAt: "asc" }
  })

  return NextResponse.json({ sessions })
}


