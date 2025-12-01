import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/blog/categories - Listar categorias com contagem de posts
export async function GET() {
  try {
    // Buscar categorias com contagem de posts publicados
    const categories = await db.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
                publishedAt: { not: null },
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc"
      },
    })

    // Formatar resposta
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      order: category.order,
      postCount: category._count.posts,
    }))

    return NextResponse.json({
      categories: formattedCategories,
    })
  } catch (error) {
    console.error("Erro ao listar categorias:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

