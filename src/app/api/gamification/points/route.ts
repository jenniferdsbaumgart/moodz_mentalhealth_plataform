import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PointsService } from "@/lib/gamification/points"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0)

    // Get point history
    const history = await PointsService.getPointHistory(session.user.id, limit, offset)

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error("Error fetching point history:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


