import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface SearchResult {
  id: string
  type: "post" | "session" | "user" | "blog" | "therapist"
  title: string
  description?: string
  url: string
}

/**
 * GET /api/search
 * Global search across posts, sessions, users, blog posts, and therapists
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()

    // Search posts (community)
    try {
      const posts = await db.post.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { content: { contains: searchTerm, mode: "insensitive" } },
          ],
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          content: true,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      })

      posts.forEach((post) => {
        results.push({
          id: post.id,
          type: "post",
          title: post.title,
          description: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
          url: `/community/posts/${post.id}`,
        })
      })
    } catch (e) {
      console.error("Error searching posts:", e)
    }

    // Search sessions (upcoming)
    try {
      const sessions = await db.groupSession.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
        select: {
          id: true,
          title: true,
          description: true,
          scheduledAt: true,
          therapist: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        take: 5,
        orderBy: { scheduledAt: "asc" },
      })

      sessions.forEach((session) => {
        const date = new Date(session.scheduledAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
        results.push({
          id: session.id,
          type: "session",
          title: session.title,
          description: `${date} • ${session.therapist.user.name || "Terapeuta"}`,
          url: `/sessions/${session.id}`,
        })
      })
    } catch (e) {
      console.error("Error searching sessions:", e)
    }

    // Search therapists (verified only)
    try {
      const therapists = await db.therapistProfile.findMany({
        where: {
          isVerified: true,
          OR: [
            { user: { name: { contains: searchTerm, mode: "insensitive" } } },
            { bio: { contains: searchTerm, mode: "insensitive" } },
            { specialties: { hasSome: [searchTerm] } },
          ],
        },
        select: {
          id: true,
          userId: true,
          bio: true,
          specialties: true,
          user: { select: { name: true, image: true } },
        },
        take: 5,
      })

      therapists.forEach((therapist) => {
        results.push({
          id: therapist.id,
          type: "therapist",
          title: therapist.user.name || "Terapeuta",
          description: therapist.specialties.slice(0, 3).join(", "),
          url: `/therapists/${therapist.userId}`,
        })
      })
    } catch (e) {
      console.error("Error searching therapists:", e)
    }

    // Search blog posts
    try {
      const blogPosts = await db.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { content: { contains: searchTerm, mode: "insensitive" } },
          ],
          published: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
        },
        take: 5,
        orderBy: { publishedAt: "desc" },
      })

      blogPosts.forEach((post) => {
        results.push({
          id: post.id,
          type: "blog",
          title: post.title,
          description: post.excerpt || undefined,
          url: `/blog/${post.slug}`,
        })
      })
    } catch (e) {
      console.error("Error searching blog posts:", e)
    }

    // Search users (only for admins)
    const userRole = (session?.user as any)?.role
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      try {
        const users = await db.user.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
          take: 5,
        })

        users.forEach((user) => {
          results.push({
            id: user.id,
            type: "user",
            title: user.name || user.email,
            description: `${user.role} • ${user.email}`,
            url: `/admin/users?search=${user.id}`,
          })
        })
      } catch (e) {
        console.error("Error searching users:", e)
      }
    }

    // Sort results by relevance (exact matches first)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm) ? 0 : 1
      const bExact = b.title.toLowerCase().includes(searchTerm) ? 0 : 1
      return aExact - bExact
    })

    return NextResponse.json({
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
      query,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
}

