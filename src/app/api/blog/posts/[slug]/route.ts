import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/blog/posts/[slug] - Buscar post por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Buscar post publicado por slug
    const post = await db.blogPost.findFirst({
      where: {
        slug: params.slug,
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true, icon: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Incrementar contador de visualizações (opcional, pode ser feito via analytics)
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })

    // Buscar posts relacionados (mesma categoria, excluindo o atual)
    const relatedPosts = await db.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        status: "PUBLISHED",
        publishedAt: { not: null },
        id: { not: post.id },
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
      },
      orderBy: {
        publishedAt: "desc"
      },
      take: 4, // Limitar a 4 posts relacionados
    })

    return NextResponse.json({
      post,
      relatedPosts,
    })
  } catch (error) {
    console.error("Erro ao buscar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
