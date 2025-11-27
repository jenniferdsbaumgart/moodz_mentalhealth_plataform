import { Report } from "@prisma/client"

export interface ReportWithContent extends Report {
  reporter: {
    id: string
    name: string | null
    email: string
    image?: string | null
  }
  post?: {
    id: string
    title: string
    authorId: string
    author: {
      id: string
      name: string | null
      email: string
    }
    _count?: {
      comments: number
      votes: number
    }
  } | null
  comment?: {
    id: string
    content: string
    authorId: string
    postId: string
    author: {
      id: string
      name: string | null
      email: string
    }
    post: {
      id: string
      title: string
    }
    _count?: {
      votes: number
      replies: number
    }
  } | null
}

export interface ModerationStats {
  pendingReports: number
  totalPosts: number
  totalComments: number
  bannedUsers: number
  resolvedToday: number
  averageResponseTime: number
  resolutionRate: number
}

export interface ModerationAction {
  id: string
  action: string
  content: string
  user: string
  time: string
  type: "removal" | "ban" | "dismiss" | "warning"
}
