import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createReportSchema } from "@/lib/validations/community"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createReportSchema.parse(body)

    // Verify that either postId or commentId is provided
    if (!validatedData.postId && !validatedData.commentId) {
      return NextResponse.json(
        { error: "Deve especificar postId ou commentId" },
        { status: 400 }
      )
    }

    // Check if the content exists and user is not reporting their own content
    let contentAuthorId = null

    if (validatedData.postId) {
      const post = await prisma.post.findUnique({
        where: { id: validatedData.postId },
        select: { authorId: true, id: true },
      })

      if (!post) {
        return NextResponse.json(
          { error: "Post não encontrado" },
          { status: 404 }
        )
      }

      contentAuthorId = post.authorId
    }

    if (validatedData.commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: validatedData.commentId },
        select: { authorId: true, id: true },
      })

      if (!comment) {
        return NextResponse.json(
          { error: "Comentário não encontrado" },
          { status: 404 }
        )
      }

      contentAuthorId = comment.authorId
    }

    // Users cannot report their own content
    if (contentAuthorId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível denunciar o próprio conteúdo" },
        { status: 400 }
      )
    }

    // Check if user already reported this content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        postId: validatedData.postId,
        commentId: validatedData.commentId,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "Você já denunciou este conteúdo" },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reason: validatedData.reason,
        description: validatedData.description,
        reporterId: session.user.id,
        postId: validatedData.postId,
        commentId: validatedData.commentId,
      },
    })

    return NextResponse.json(
      {
        data: report,
        message: "Denúncia enviada com sucesso. Nossa equipe irá analisar."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating report:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

