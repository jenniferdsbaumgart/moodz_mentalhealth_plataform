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
  relevance?: number
}

type SearchType = "post" | "session" | "user" | "blog" | "therapist"

/**
 * GET /api/search
 * Global search across posts, sessions, users, blog posts, and therapists
 * 
 * Query params:
 * - q: Search query (required, min 2 chars)
 * - type: Filter by type (optional: post, session, user, blog, therapist)
 * - limit: Max results per type (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") as SearchType | null
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], query: query || "" })
    }

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()
    const perTypeLimit = type ? limit : Math.ceil(limit / 4)

    // Helper to calculate relevance score
    const calculateRelevance = (title: string, content?: string): number => {
      const titleLower = title.toLowerCase()
      let score = 0
      
      // Exact title match
      if (titleLower === searchTerm) score += 100
      // Title starts with search term
      else if (titleLower.startsWith(searchTerm)) score += 80
      // Title contains search term
      else if (titleLower.includes(searchTerm)) score += 60
      // Content contains search term
      else if (content?.toLowerCase().includes(searchTerm)) score += 40
      
      return score
    }

    // Search posts (community)
    if (!type || type === "post") {
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
            category: { select: { name: true } },
          },
          take: perTypeLimit,
          orderBy: { createdAt: "desc" },
        })

        posts.forEach((post) => {
          results.push({
            id: post.id,
            type: "post",
            title: post.title,
            description: `${post.category?.name || "Comunidade"} • ${post.content.slice(0, 80)}...`,
            url: `/community/posts/${post.id}`,
            relevance: calculateRelevance(post.title, post.content),
          })
        })
      } catch (e) {
        console.error("Error searching posts:", e)
      }
    }

    // Search sessions (upcoming)
    if (!type || type === "session") {
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
            category: true,
            therapist: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          take: perTypeLimit,
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
            description: `${session.therapist.user.name || "Terapeuta"} • ${date}`,
            url: `/sessions/${session.id}`,
            relevance: calculateRelevance(session.title, session.description),
          })
        })
      } catch (e) {
        console.error("Error searching sessions:", e)
      }
    }

    // Search therapists (verified only)
    if (!type || type === "therapist") {
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
          take: perTypeLimit,
        })

        therapists.forEach((therapist) => {
          const name = therapist.user.name || "Terapeuta"
          results.push({
            id: therapist.id,
            type: "therapist",
            title: name,
            description: therapist.specialties.slice(0, 3).join(", ") || therapist.bio?.slice(0, 80),
            url: `/therapists/${therapist.userId}`,
            relevance: calculateRelevance(name, therapist.bio || ""),
          })
        })
      } catch (e) {
        console.error("Error searching therapists:", e)
      }
    }

    // Search blog posts
    if (!type || type === "blog") {
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
          take: perTypeLimit,
          orderBy: { publishedAt: "desc" },
        })

        blogPosts.forEach((post) => {
          results.push({
            id: post.id,
            type: "blog",
            title: post.title,
            description: post.excerpt || undefined,
            url: `/blog/${post.slug}`,
            relevance: calculateRelevance(post.title, post.excerpt || ""),
          })
        })
      } catch (e) {
        console.error("Error searching blog posts:", e)
      }
    }

    // Search users (only for admins)
    const userRole = (session?.user as any)?.role
    if ((!type || type === "user") && (userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
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
            status: true,
          },
          take: perTypeLimit,
        })

        users.forEach((user) => {
          const displayName = user.name || user.email
          results.push({
            id: user.id,
            type: "user",
            title: displayName,
            description: `${user.role} • ${user.email}${user.status !== "ACTIVE" ? ` • ${user.status}` : ""}`,
            url: `/admin/users?search=${user.email}`,
            relevance: calculateRelevance(displayName, user.email),
          })
        })
      } catch (e) {
        console.error("Error searching users:", e)
      }
    }

    // Sort results by relevance (higher score first, then alphabetically)
    const sortedResults = results.sort((a, b) => {
      // First by relevance score
      const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
      if (relevanceDiff !== 0) return relevanceDiff
      
      // Then alphabetically by title
      return a.title.localeCompare(b.title)
    })

    // Remove relevance from response (internal use only)
    const cleanResults = sortedResults.slice(0, limit).map(({ relevance, ...rest }) => rest)

    return NextResponse.json({
      results: cleanResults,
      total: sortedResults.length,
      query,
      type: type || "all",
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
}
