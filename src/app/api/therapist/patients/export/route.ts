import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
        include: { profile: true, patientProfile: true }
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
        phone: p.user.profile?.phone || "",
        birthDate: p.user.profile?.birthDate ? format(new Date(p.user.profile.birthDate), "dd/MM/yyyy") : "",
        sessionCount: 0,
        lastSessionDate: p.session.scheduledAt,
        categories: [],
        registrationDate: p.user.createdAt,
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
    "Nome": p.name || "N/A",
    "Email": p.email,
    "Telefone": p.phone,
    "Data de Nascimento": p.birthDate,
    "Data de Cadastro": format(new Date(p.registrationDate), "dd/MM/yyyy", { locale: ptBR }),
    "Total de Sessões": p.sessionCount,
    "Última Sessão": format(new Date(p.lastSessionDate), "dd/MM/yyyy", { locale: ptBR }),
    "Categorias": p.categories.join(", ") || "Nenhuma",
    "Status": p.sessionCount > 0 ? "Ativo" : "Inativo",
  }))

  // Criar CSV
  const headers = Object.keys(patients[0] || {})
  const csvContent = [
    headers.join(","),
    ...patients.map(patient =>
      headers.map(header => {
        const value = patient[header as keyof typeof patient] || ""
        // Escapar valores que contenham vírgulas ou aspas
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(",")
    )
  ].join("\n")

  // Retornar como arquivo CSV
  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=pacientes_${format(new Date(), "yyyy-MM-dd", { locale: ptBR })}.csv`,
    },
  })

  return response
}
