import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { reason } = await req.json()

  // Marcar como rejeitado ou deletar
  await db.therapistProfile.delete({
    where: { id }
  })

  // TODO: Enviar email com motivo da rejeição

  return NextResponse.json({ success: true })
}


