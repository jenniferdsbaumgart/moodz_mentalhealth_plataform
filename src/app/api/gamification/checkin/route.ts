import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StreakService } from "@/lib/gamification/streak"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Perform daily check-in
    const result = await StreakService.performDailyCheckIn(session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro ao realizar check-in" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        isNewCheckIn: result.isNewCheckIn,
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        pointsAwarded: result.pointsAwarded,
        streakBonus: result.streakBonus,
        badgesAwarded: result.badgesAwarded,
      },
      message: result.isNewCheckIn
        ? "Check-in diário realizado com sucesso!"
        : "Você já fez check-in hoje!",
    })
  } catch (error) {
    console.error("Error performing check-in:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "stats"

    if (type === "calendar") {
      // Get check-in calendar
      const days = Math.min(parseInt(searchParams.get("days") || "30"), 365)
      const calendar = await StreakService.getCheckInCalendar(session.user.id, days)

      return NextResponse.json({ data: calendar })
    } else {
      // Get streak stats
      const stats = await StreakService.getStreakStats(session.user.id)

      // Check if user has checked in today
      const hasCheckedInToday = await StreakService.hasCheckedInToday(session.user.id)

      return NextResponse.json({
        data: {
          ...stats,
          hasCheckedInToday,
        }
      })
    }
  } catch (error) {
    console.error("Error fetching streak data:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
