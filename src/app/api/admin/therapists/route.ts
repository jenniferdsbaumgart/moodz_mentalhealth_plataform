import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const therapists = await db.therapistProfile.findMany({
    where: status === "pending" ? { verified: false } : undefined,
    include: {
      user: {
        include: { profile: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ therapists })
}

