import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

// GET /api/therapist/patients - List patients who attended therapist's sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== Role.THERAPIST) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // Get therapist profile
    const therapistProfile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json({ error: "Therapist profile not found" }, { status: 404 })
    }

    // Find all unique patients who attended this therapist's sessions
    const participants = await db.sessionParticipant.findMany({
      where: {
        session: {
          therapistId: therapistProfile.id
        },
        status: "ATTENDED"
      },
      include: {
        user: {
          include: {
            patientProfile: true
          }
        },
        session: true
      },
      orderBy: { createdAt: "desc" }
    })

    // Group by user and get unique patients
    const patientMap = new Map()

    for (const p of participants) {
      if (!patientMap.has(p.userId)) {
        patientMap.set(p.userId, {
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          image: p.user.image,
          patientProfile: p.user.patientProfile,
          sessionsAttended: 1,
          lastSessionDate: p.session.scheduledAt
        })
      } else {
        const existing = patientMap.get(p.userId)
        existing.sessionsAttended++
        if (new Date(p.session.scheduledAt) > new Date(existing.lastSessionDate)) {
          existing.lastSessionDate = p.session.scheduledAt
        }
      }
    }

    let patients = Array.from(patientMap.values())

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      patients = patients.filter(
        p => p.name?.toLowerCase().includes(searchLower) || p.email.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("Error fetching therapist patients:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
