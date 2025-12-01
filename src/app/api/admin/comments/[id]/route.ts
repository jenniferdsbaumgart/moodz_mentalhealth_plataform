import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * DELETE /api/admin/comments/[id]
 * Delete a comment (admin moderation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const commentId = params.id

    // Get comment info before deletion for logging
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        authorId: true,
        postId: true,
        author: { select: { name: true, email: true } },
        post: { select: { title: true } }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Delete comment
    await db.comment.delete({
      where: { id: commentId }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_COMMENT",
        entityType: "COMMENT",
        entityId: commentId,
        details: JSON.stringify({
          commentContent: comment.content.slice(0, 100),
          postId: comment.postId,
          postTitle: comment.post.title,
          authorId: comment.authorId,
          authorName: comment.author.name,
          authorEmail: comment.author.email
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/comments/[id]
 * Get comment details for moderation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!["ADMIN", "SUPER_ADMIN"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const comment = await db.comment.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error fetching comment:", error)
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 }
    )
  }
}
