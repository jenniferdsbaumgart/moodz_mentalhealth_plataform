import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
/**
 * POST /api/admin/reports/[id]/claim
 * Claim a report for review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
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
    const { id: reportId } = await params
    // Update report status to IN_REVIEW or REVIEWING
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: "REVIEWING",
        resolvedBy: session.user.id
      }
    })
    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_RESOLVED", // Using REPORT_RESOLVED as generic action for report updates
        entity: "REPORT",
        entityId: reportId,
        details: {
          previousStatus: "PENDING",
          newStatus: "REVIEWING",
          action: "CLAIM"
        }
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
