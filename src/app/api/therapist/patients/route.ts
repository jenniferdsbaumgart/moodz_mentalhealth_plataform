import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const therapistId = session.user.id

  // Buscar participantes únicos das sessões do terapeuta
  const participants = await db.sessionParticipant.findMany({
    where: {
      session: { therapistId }
    },
    include: {
      user: {
        include: { profile: true }
      },
      session: true
    },
    orderBy: { joinedAt: "desc" }
  })

  // Agrupar por usuário
  const patientMap = new Map()

  for (const p of participants) {
    const userId = p.userId
    if (!patientMap.has(userId)) {
      patientMap.set(userId, {
        id: userId,
        name: p.user.profile?.name || p.user.name,
        email: p.user.email,
        image: p.user.image,
        sessionCount: 0,
        lastSessionDate: p.session.scheduledAt,
        categories: []
      })
    }

    const patient = patientMap.get(userId)
    patient.sessionCount++
    if (p.session.scheduledAt > patient.lastSessionDate) {
      patient.lastSessionDate = p.session.scheduledAt
    }
    if (p.session.category && !patient.categories.includes(p.session.category)) {
      patient.categories.push(p.session.category)
    }
  }

  const patients = Array.from(patientMap.values()).map(p => ({
    ...p,
    favoriteCategory: p.categories[0] || "Geral"
  }))

  return NextResponse.json({ patients })
}


