import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit/service"

const settingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  allowNewRegistrations: z.boolean().optional(),
  maxSessionParticipants: z.number().min(2).max(50).optional(),
  maxPostsPerDay: z.number().min(1).max(100).optional(),
  defaultSessionDuration: z.number().min(15).max(180).optional(),
})

// GET - Buscar configurações
export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  let settings = await db.systemSettings.findUnique({
    where: { id: "system" },
  })
  if (!settings) {
    settings = await db.systemSettings.create({
      data: { id: "system" },
    })
  }

  return NextResponse.json(settings)
}

// PATCH - Atualizar configurações
export async function PATCH(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = settingsSchema.parse(body)

    // Buscar configurações anteriores para log
    const previousSettings = await db.systemSettings.findUnique({
      where: { id: "system" },
    })

    const updatedSettings = await db.systemSettings.upsert({
      where: { id: "system" },
      update: {
        ...data,
        updatedBy: session.user.id,
      },
      create: {
        id: "system",
        ...data,
        updatedBy: session.user.id,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "SYSTEM_CONFIG_CHANGED",
      entity: "SystemSettings",
      entityId: "system",
      details: {
        previous: previousSettings,
        current: updatedSettings,
        changedFields: Object.keys(data),
      },
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar configurações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

