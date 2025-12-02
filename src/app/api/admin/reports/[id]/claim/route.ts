import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * POST /api/admin/reports/[id]/claim
 * Claim a report for review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reportId = params.id

    // Update report status to IN_REVIEW
    const report = await db.report.update({
      where: { id: reportId },
      data: { status: "IN_REVIEW" }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CLAIM_REPORT",
        entityType: "REPORT",
        entityId: reportId,
        details: JSON.stringify({ previousStatus: "PENDING" })
      }
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error claiming report:", error)
    return NextResponse.json(
      { error: "Failed to claim report" },
      { status: 500 }
    )
  }
}

