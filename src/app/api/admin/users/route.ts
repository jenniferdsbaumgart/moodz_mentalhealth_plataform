import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const role = searchParams.get("role")
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const engagement = searchParams.get("engagement")
  const verified = searchParams.get("verified")

  const where: any = {}

  if (role) where.role = role
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ]
  }

  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  // Therapist verification filter
  if (verified && role === "THERAPIST") {
    where.therapistProfile = {
      verified: verified === "verified" ? true : verified === "pending" ? false : undefined
    }
  }

  // Get users with counts
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        image: true,
        _count: {
          select: {
            sessionParticipants: true,
            posts: true
          }
        },
        therapistProfile: role === "THERAPIST" ? {
          select: {
            isVerified: true
          }
        } : false
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    db.user.count({ where })
  ])

  // Filter by engagement level if specified
  let filteredUsers = users
  if (engagement) {
    filteredUsers = users.filter(user => {
      const sessionCount = user._count.sessionParticipants
      switch (engagement) {
        case "high":
          return sessionCount >= 10
        case "medium":
          return sessionCount >= 5 && sessionCount < 10
        case "low":
          return sessionCount >= 1 && sessionCount < 5
        case "none":
          return sessionCount === 0
        default:
          return true
      }
    })
  }

  return NextResponse.json({
    users: filteredUsers,
    total: engagement ? filteredUsers.length : total,
    page,
    limit,
    totalPages: Math.ceil((engagement ? filteredUsers.length : total) / limit)
  })
}

