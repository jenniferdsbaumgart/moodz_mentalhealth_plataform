import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BadgeService } from "@/lib/gamification/badges"

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
    const category = searchParams.get("category")
    const rarity = searchParams.get("rarity")

    // Get all badges
    const badges = await BadgeService.getAllBadges()

    // Filter if needed
    let filteredBadges = badges

    if (category) {
      filteredBadges = filteredBadges.filter(badge => badge.category === category)
    }

    if (rarity) {
      filteredBadges = filteredBadges.filter(badge => badge.rarity === rarity)
    }

    return NextResponse.json({ data: filteredBadges })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


