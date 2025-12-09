import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifyTherapistApproved } from "@/lib/notifications/triggers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Get therapist profile to get userId
  const therapistProfile = await db.therapistProfile.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!therapistProfile) {
    return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
  }

  // Update therapist profile
  await db.therapistProfile.update({
    where: { id },
    data: {
      isVerified: true,
      verifiedAt: new Date()
    }
  })

  // Send notification about approval (non-blocking)
  notifyTherapistApproved(therapistProfile.userId).catch(console.error)

  return NextResponse.json({ success: true })
}


