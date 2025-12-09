import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { blogPostUpdateSchema } from "@/lib/validations/blog"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/blog/utils"

// GET /api/therapist/blog/posts/[id] - Buscar post próprio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params

  try {
    const post = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
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
    // ...
    return NextResponse.json(post)
  } catch (error) {
    console.error("Erro ao buscar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/therapist/blog/posts/[id] - Atualizar post próprio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()

    // Validar dados (partial)
    const validatedData = blogPostUpdateSchema.parse({ ...body, id })

    // Verificar se post existe e é do therapist
    const existingPost = await db.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Verificar se é o autor
    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title

      // Regenerar slug se título mudou
      const newSlug = validatedData.slug || generateSlug(validatedData.title)
      if (newSlug !== existingPost.slug) {
        // Verificar se novo slug já existe (exceto o próprio post)
        const slugExists = await db.blogPost.findFirst({
          where: {
            slug: newSlug,
            id: { not: id },
          },
        })

        if (slugExists) {
          return NextResponse.json(
            { error: "Slug já existe. Escolha um título diferente." },
            { status: 400 }
          )
        }

        updateData.slug = newSlug
      }
    }

    if (validatedData.excerpt !== undefined) {
      updateData.excerpt = validatedData.excerpt
    }

    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content
      updateData.readingTime = calculateReadingTime(validatedData.content)

      // Regenerar excerpt se não foi fornecido
      if (validatedData.excerpt === undefined) {
        updateData.excerpt = extractExcerpt(validatedData.content)
      }
    }

    if (validatedData.coverImage !== undefined) {
      updateData.coverImage = validatedData.coverImage
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }

    if (validatedData.publishedAt !== undefined) {
      updateData.publishedAt = validatedData.publishedAt ? new Date(validatedData.publishedAt) : null
    }

    if (validatedData.categoryId !== undefined) {
      updateData.categoryId = validatedData.categoryId
    }

    // Atualizar tags se fornecidas
    if (validatedData.tagIds !== undefined) {
      // Remover tags existentes
      await db.blogPostTag.deleteMany({
        where: { postId: id },
      })

      // Adicionar novas tags
      if (validatedData.tagIds.length > 0) {
        updateData.tags = {
          create: validatedData.tagIds.map(tagId => ({
            tagId,
          })),
        }
      }
    }

    // Atualizar post
    const post = await db.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
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
    })

    return NextResponse.json(post)
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Erro ao atualizar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


