import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth, subDays, format, eachDayOfInterval } from "date-fns"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    // Get mood entries for the last 30 days
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        patientId: patient.id,
        date: {
          gte: thirtyDaysAgo,
          lte: now,
        },
      },
      orderBy: { date: "asc" },
    })

    // Calculate statistics
    const totalEntries = moodEntries.length
    const averageMood = totalEntries > 0
      ? Math.round((moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries) * 10) / 10
      : 0

    const averageEnergy = totalEntries > 0
      ? Math.round((moodEntries.filter(e => e.energy).reduce((sum, entry) => sum + entry.energy!, 0) /
        moodEntries.filter(e => e.energy).length) * 10) / 10
      : 0

    const averageAnxiety = totalEntries > 0
      ? Math.round((moodEntries.filter(e => e.anxiety).reduce((sum, entry) => sum + entry.anxiety!, 0) /
        moodEntries.filter(e => e.anxiety).length) * 10) / 10
      : 0

    const averageSleep = totalEntries > 0
      ? Math.round((moodEntries.filter(e => e.sleep).reduce((sum, entry) => sum + entry.sleep!, 0) /
        moodEntries.filter(e => e.sleep).length) * 10) / 10
      : 0

    // Calculate current streak
    const streak = await calculateCurrentStreak(patient.id)

    // Get most common emotions
    const allEmotions = moodEntries.flatMap(entry => entry.emotions)
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count, percentage: Math.round((count / allEmotions.length) * 100) }))

    // Get most common activities
    const allActivities = moodEntries.flatMap(entry => entry.activities)
    const activityCounts = allActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity, count]) => ({ activity, count, percentage: Math.round((count / allActivities.length) * 100) }))

    // Generate insights
    const mappedEntries = moodEntries.map(e => ({
      ...e,
      energy: e.energy ?? undefined,
      anxiety: e.anxiety ?? undefined,
      sleep: e.sleep ?? undefined
    }))
    const insights = generateInsights(mappedEntries, mostCommonActivities)

    // Prepare chart data (last 30 days)
    const chartData = eachDayOfInterval({ start: thirtyDaysAgo, end: now })
      .map(date => {
        const entry = moodEntries.find(e =>
          format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
        return {
          date: format(date, 'MMM dd'),
          fullDate: format(date, 'yyyy-MM-dd'),
          mood: entry?.mood || null,
          energy: entry?.energy || null,
          anxiety: entry?.anxiety || null,
          sleep: entry?.sleep || null,
          hasEntry: !!entry,
        }
      })

    // Prepare heatmap data (current month)
    const monthDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })
    const heatmapData = monthDays.map(date => {
      const entry = moodEntries.find(e =>
        format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: date.getDate(),
        week: Math.floor((date.getDate() - 1) / 7),
        mood: entry?.mood || null,
        hasEntry: !!entry,
      }
    })

    return NextResponse.json({
      data: {
        statistics: {
          totalEntries,
          averageMood,
          averageEnergy,
          averageAnxiety,
          averageSleep,
          currentStreak: streak,
          mostCommonEmotions,
          mostCommonActivities,
        },
        insights,
        chartData,
        heatmapData,
      },
    })
  } catch (error) {
    console.error("Error fetching mood stats:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

async function calculateCurrentStreak(patientId: string): Promise<number> {
  const now = new Date()
  let streak = 0
  const checkDate = new Date(now)

  // Check consecutive days backwards from today
  while (streak < 365) { // Prevent infinite loop
    const startOfDay = new Date(checkDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)

    const entry = await prisma.moodEntry.findFirst({
      where: {
        patientId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (entry) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

function generateInsights(
  entries: Array<{
    date: Date
    mood: number
    energy?: number
    anxiety?: number
    sleep?: number
    emotions: string[]
    activities: string[]
  }>,
  activities: Array<{ activity: string; count: number; percentage: number }>
): string[] {
  const insights: string[] = []

  // Streak insight
  if (entries.length > 0) {
    const recentEntries = entries.filter(e =>
      new Date(e.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    if (recentEntries.length >= 7) {
      insights.push("Seu streak atual é de 7 dias! Continue assim! 🎉")
    } else if (recentEntries.length >= 3) {
      insights.push(`Você registrou humor por ${recentEntries.length} dos últimos 7 dias.`)
    }
  }

  // Activity correlation insight
  if (activities.length > 0 && entries.length > 5) {
    const topActivity = activities[0]
    const entriesWithActivity = entries.filter(e =>
      e.activities.includes(topActivity.activity)
    )
    const avgMoodWithActivity = entriesWithActivity.reduce((sum, e) => sum + e.mood, 0) / entriesWithActivity.length
    const avgMoodWithoutActivity = entries.filter(e =>
      !e.activities.includes(topActivity.activity)
    ).reduce((sum, e) => sum + e.mood, 0) / entries.filter(e =>
      !e.activities.includes(topActivity.activity)
    ).length || 0

    if (avgMoodWithActivity > avgMoodWithoutActivity + 0.5) {
      insights.push(`Seu humor tende a melhorar em dias com ${topActivity.activity.toLowerCase()} (+${(avgMoodWithActivity - avgMoodWithoutActivity).toFixed(1)} pontos de humor médio).`)
    }
  }

  // Day of week pattern
  if (entries.length >= 14) {
    const dayPatterns = entries.reduce((acc, entry) => {
      const dayOfWeek = new Date(entry.date).getDay()
      if (!acc[dayOfWeek]) acc[dayOfWeek] = []
      acc[dayOfWeek].push(entry.mood)
      return acc
    }, {} as Record<number, number[]>)

    const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
    const dayAverages = Object.entries(dayPatterns).map(([day, moods]) => ({
      day: parseInt(day),
      average: moods.reduce((sum, mood) => sum + mood, 0) / moods.length,
      count: moods.length,
    })).filter(d => d.count >= 2) // At least 2 entries for that day

    if (dayAverages.length > 0) {
      const lowestDay = dayAverages.reduce((prev, current) =>
        prev.average < current.average ? prev : current
      )
      const highestDay = dayAverages.reduce((prev, current) =>
        prev.average > current.average ? prev : current
      )

      if (lowestDay.average < highestDay.average - 1) {
        insights.push(`Você tende a se sentir menos bem aos ${dayNames[lowestDay.day]}s (${lowestDay.average.toFixed(1)} de humor médio).`)
        insights.push(`Seus dias mais positivos são os ${dayNames[highestDay.day]}s (${highestDay.average.toFixed(1)} de humor médio).`)
      }
    }
  }

  // Overall improvement trend
  if (entries.length >= 10) {
    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2))
    const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / secondHalf.length

    const improvement = secondHalfAvg - firstHalfAvg
    if (Math.abs(improvement) >= 0.5) {
      if (improvement > 0) {
        insights.push(`Seu humor melhorou em média ${improvement.toFixed(1)} pontos nos últimos registros. 📈`)
      } else {
        insights.push(`Seu humor diminuiu em média ${Math.abs(improvement).toFixed(1)} pontos nos últimos registros. 📉`)
      }
    }
  }

  // Default insights if no specific patterns found
  if (insights.length === 0) {
    insights.push("Continue registrando seu humor diariamente para obter insights mais precisos sobre seus padrões emocionais.")
    if (entries.length < 7) {
      insights.push("Registre seu humor por pelo menos uma semana para começar a ver padrões interessantes!")
    }
  }

  return insights.slice(0, 4) // Limit to 4 insights
}
