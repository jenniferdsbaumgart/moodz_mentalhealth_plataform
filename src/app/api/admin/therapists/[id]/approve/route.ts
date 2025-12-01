import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.therapistProfile.update({
    where: { id: params.id },
    data: { verified: true, verifiedAt: new Date() }
  })

  // TODO: Enviar email de aprovação

  return NextResponse.json({ success: true })
}

