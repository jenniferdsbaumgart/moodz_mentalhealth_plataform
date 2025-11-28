import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit/service"

// DELETE - Remover admin (soft delete ou hard delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = params

  // Não permitir auto-remoção
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Você não pode remover a si mesmo" },
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

  // Rebaixar para PATIENT ao invés de deletar
  const updatedUser = await db.user.update({
    where: { id },
    data: { role: "PATIENT" },
  })

  await createAuditLog({
    userId: session.user.id,
    action: "ADMIN_REMOVED",
    entity: "User",
    entityId: id,
    details: {
      adminEmail: admin.email,
      adminName: admin.name,
    },
  })

  return NextResponse.json({ success: true })
}
