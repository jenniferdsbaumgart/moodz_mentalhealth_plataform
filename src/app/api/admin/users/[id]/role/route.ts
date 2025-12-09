import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"
/**
 * PATCH /api/admin/users/[id]/role
 * Change a user's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Check if user is admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id: userId } = await params
    const body = await request.json()
    const { role, reason } = body
    // Validate role
    const validRoles = ["PATIENT", "THERAPIST", "ADMIN"]
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be PATIENT, THERAPIST, or ADMIN" },
        { status: 400 }
      )
    }
    // Prevent admin from demoting themselves
    if (userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot demote yourself" },
        { status: 400 }
      )
    }
    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true, email: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const previousRole = currentUser.role
    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    // If promoting to therapist, create therapist profile if doesn't exist
    if (role === "THERAPIST") {
      const existingProfile = await db.therapistProfile.findUnique({
        where: { userId: userId }
      })
      if (!existingProfile) {
        await db.therapistProfile.create({
          data: {
            userId: userId,
            crp: `PENDING-${userId.substring(0, 8)}`, // Temporary CRP
            specialties: [],
            specializations: ["Geral"],
            bio: "",
            isVerified: false
          }
        })
      }
    }
    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ROLE_CHANGED",
        entity: "USER",
        entityId: userId,
        details: {
          previousRole,
          newRole: role,
          reason: reason || null
        }
      }
    })
    // Notify user about role change
    const roleLabels: Record<string, string> = {
      PATIENT: "Paciente",
      THERAPIST: "Terapeuta",
      ADMIN: "Administrador"
    }
    await createNotification({
      userId: userId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title: "Função alterada",
      message: `Sua função foi alterada de ${roleLabels[previousRole]} para ${roleLabels[role]}.${reason ? ` Motivo: ${reason}` : ""}`,
      data: { link: "/profile" }
    })
    return NextResponse.json({
      success: true,
      user: updatedUser,
      previousRole,
      newRole: role
    })
  } catch (error) {
    console.error("Error changing user role:", error)
    return NextResponse.json(
      { error: "Failed to change user role" },
      { status: 500 }
    )
  }
}
