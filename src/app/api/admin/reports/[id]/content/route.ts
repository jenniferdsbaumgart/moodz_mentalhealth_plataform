import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET /api/admin/reports/[id]/content
 * Get full content details for a report including context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
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

    const { id: reportId } = await params

    // Get the report to know what content to fetch
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: {
        postId: true,
        commentId: true
      }
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    let content = null
    let parentPost = null
    let relatedComments: any[] = []
    let otherReports: any[] = []

    if (report.postId) {
      // Get post with comments
      const post = await db.post.findUnique({
        where: { id: report.postId },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          comments: {
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              createdAt: true,
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

      if (post) {
        content = post
        relatedComments = post.comments
      }
    } else if (report.commentId) {
      // Get comment with parent post
      const comment = await db.comment.findUnique({
        where: { id: report.commentId },
        select: {
          id: true,
          content: true,
          createdAt: true,
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
              category: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              comments: {
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
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
          }
        }
      })

      if (comment) {
        content = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: comment.author,
          type: "COMMENT"
        }
        parentPost = comment.post
        relatedComments = comment.post?.comments || []
      }
    }

    // Get other reports on the same content
    const whereClause = report.postId
      ? { postId: report.postId }
      : (report.commentId ? { commentId: report.commentId } : null)

    if (whereClause) {
      otherReports = await db.report.findMany({
        where: {
          ...whereClause,
          id: { not: reportId }
        },
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    }

    return NextResponse.json({
      content: content,
      context: {
        parentPost,
        relatedComments
      },
      otherReports
    })

  } catch (error) {
    console.error("Error fetching report content:", error)
    return NextResponse.json(
      { error: "Failed to fetch report content" },
      { status: 500 }
    )
  }
}
