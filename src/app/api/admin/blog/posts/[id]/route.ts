import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

// GET /api/admin/blog/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || !([Role.ADMIN, Role.SUPER_ADMIN] as Role[]).includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { name: true } },
        category: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/admin/blog/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, categoryId, status } = body

    const existing = await db.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if new slug is unique (if changed)
    if (slug !== existing.slug) {
      const slugExists = await db.blogPost.findUnique({ where: { slug } })
      if (slugExists) {
        return NextResponse.json({ error: "Slug já existe" }, { status: 400 })
      }
    }

    // Calculate reading time
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // Determine publishedAt
    let publishedAt = existing.publishedAt
    if (status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date()
    } else if (status !== "PUBLISHED") {
      publishedAt = null
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        categoryId,
        status,
        readingTime,
        publishedAt
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || !([Role.ADMIN, Role.SUPER_ADMIN] as Role[]).includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.blogPost.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
