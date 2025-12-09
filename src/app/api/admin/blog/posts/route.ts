import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

// GET /api/admin/blog/posts - List all posts for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || !([Role.ADMIN, Role.SUPER_ADMIN] as Role[]).includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } }
      ]
    }

    if (status) {
      where.status = status
    }

    const posts = await db.blogPost.findMany({
      where,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching admin blog posts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/admin/blog/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || !([Role.ADMIN, Role.SUPER_ADMIN] as Role[]).includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, categoryId, status } = body

    // Check if slug is unique
    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 400 })
    }

    // Calculate reading time (approx 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        categoryId,
        authorId: session.user.id,
        status,
        readingTime,
        publishedAt: status === "PUBLISHED" ? new Date() : null
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating blog post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
