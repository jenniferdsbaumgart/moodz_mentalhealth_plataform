import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { blogPostUpdateSchema } from "@/lib/validations/blog"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/blog/utils"
import { createAuditLog } from "@/lib/audit/service"
import { AuditAction } from "@prisma/client"

// GET /api/admin/blog/posts/[id] - Buscar post por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { id: params.id },
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

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Erro ao buscar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blog/posts/[id] - Atualizar post
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Validar dados (partial)
    const validatedData = blogPostUpdateSchema.parse({ ...body, id: params.id })

    // Verificar se post existe
    const existingPost = await db.blogPost.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
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
            id: { not: params.id },
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
        where: { postId: params.id },
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
      where: { id: params.id },
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

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      action: AuditAction.POST_DELETED, // TODO: Add BLOG_POST_UPDATED
      entity: "BlogPost",
      entityId: post.id,
      details: {
        title: post.title,
        changes: Object.keys(updateData),
      },
    })

    return NextResponse.json(post)
  } catch (error) {
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

// DELETE /api/admin/blog/posts/[id] - Deletar post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    // Verificar se post existe
    const existingPost = await db.blogPost.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    // Verificar se usuário pode deletar (próprio post ou admin)
    if (existingPost.authorId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar este post" },
        { status: 403 }
      )
    }

    // Deletar post (cascade delete remove tags automaticamente)
    await db.blogPost.delete({
      where: { id: params.id },
    })

    // Log de auditoria
    await createAuditLog({
      userId: session.user.id,
      action: AuditAction.POST_DELETED,
      entity: "BlogPost",
      entityId: params.id,
      details: {
        title: existingPost.title,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
