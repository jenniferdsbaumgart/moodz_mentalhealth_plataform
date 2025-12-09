import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit/service"

// POST - Rebaixar admin para paciente
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Você não pode rebaixar a si mesmo" },
      { status: 400 }
    )
  }

  const admin = await db.user.findUnique({
    where: { id },
  })

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrador não encontrado" },
      { status: 404 }
    )
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      role: "PATIENT",
      patientProfile: {
        create: {
          points: 0,
          level: 1,
          streak: 0,
        },
      },
    },
  })

  await createAuditLog({
    userId: session.user.id,
    action: "ROLE_CHANGED",
    entity: "User",
    entityId: id,
    details: {
      previousRole: "ADMIN",
      newRole: "PATIENT",
      email: admin.email,
    },
  })

  return NextResponse.json(updatedUser)
}


