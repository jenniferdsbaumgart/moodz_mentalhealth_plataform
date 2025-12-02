import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ReportStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "PENDING"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

    // Validate status
    const validStatuses = ["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"] as const
    if (!validStatuses.includes(status as any)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Get reports with related content
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: status as ReportStatus },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  votes: true,
                },
              },
            },
          },
          comment: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              post: {
                select: {
                  id: true,
                  title: true,
                },
              },
              _count: {
                select: {
                  votes: true,
                  replies: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({
        where: { status: status as ReportStatus },
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}



