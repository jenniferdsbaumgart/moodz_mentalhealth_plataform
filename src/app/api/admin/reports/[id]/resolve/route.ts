import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
/**
 * POST /api/admin/reports/[id]/resolve
 * Resolve a report with an action
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
    const body = await request.json()
    const { action, note } = body
    // Validate action
    const validActions = ["approve", "dismiss", "delete", "warn", "suspend", "ban"]
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }
    // Determine new status based on action
    const newStatus = action === "dismiss" ? "DISMISSED" : "RESOLVED"
    // Update report
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
        resolvedBy: session.user.id
      }
    })
    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_RESOLVED",
        entity: "REPORT",
        entityId: reportId,
        details: {
          action,
          note,
          originalAction: action === "dismiss" ? "DISMISS" : "RESOLVE",
          previousStatus: report.status
        }
      }
    })
    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error resolving report:", error)
    return NextResponse.json(
      { error: "Failed to resolve report" },
      { status: 500 }
    )
  }
}
