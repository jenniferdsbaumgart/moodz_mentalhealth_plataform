import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BadgeService } from "@/lib/gamification/badges"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Get user's badges
    const userBadges = await BadgeService.getUserBadges(session.user.id)

    // Get badge progress (badges they don't have yet)
    const badgeProgress = await BadgeService.getBadgeProgress()

    return NextResponse.json({
      data: {
        ownedBadges: userBadges,
        progress: badgeProgress,
      }
    })
  } catch (error) {
    console.error("Error fetching user badges:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
