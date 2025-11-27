import { PostCategory, ReportReason } from "@prisma/client"

export interface PostWithDetails {
  id: string
  title: string
  content: string
  excerpt?: string
  category: PostCategory
  authorId: string
  author: {
    id: string
    name?: string
    image?: string
    role: string
  }
  isAnonymous: boolean
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  _count: {
    comments: number
    votes: number
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
      color?: string
    }
  }>
  userVote?: {
    value: number
  } | null
}

export interface CommentWithDetails {
  id: string
  content: string
  postId: string
  authorId: string
  author: {
    id: string
    name?: string
    image?: string
    role: string
  }
  parentId?: string | null
  replies?: CommentWithDetails[]
  isAnonymous: boolean
  isEdited: boolean
  createdAt: string
  updatedAt: string
  _count: {
    votes: number
    replies: number
  }
  userVote?: {
    value: number
  } | null
}

export interface VoteData {
  value: 1 | -1
  postId?: string
  commentId?: string
}

export interface ReportData {
  reason: ReportReason
  description?: string
  postId?: string
  commentId?: string
}

export interface CreatePostData {
  title: string
  content: string
  category: PostCategory
  isAnonymous?: boolean
  tagIds?: string[]
}

export interface CreateCommentData {
  content: string
  postId: string
  parentId?: string
  isAnonymous?: boolean
}

export interface TagWithUsage {
  id: string
  name: string
  slug: string
  color?: string
  usageCount: number
}

export interface CommunityFilters {
  category?: PostCategory
  authorId?: string
  tagId?: string
  isPinned?: boolean
  search?: string
  sortBy?: 'newest' | 'oldest' | 'popular' | 'mostCommented'
  page?: number
  limit?: number
}

export const POST_CATEGORIES = {
  GENERAL: { label: "Geral", icon: "MessageCircle", color: "gray" },
  EXPERIENCES: { label: "Experiências", icon: "BookOpen", color: "blue" },
  QUESTIONS: { label: "Perguntas", icon: "HelpCircle", color: "green" },
  SUPPORT: { label: "Suporte", icon: "Heart", color: "red" },
  VICTORIES: { label: "Vitórias", icon: "Trophy", color: "yellow" },
  RESOURCES: { label: "Recursos", icon: "Link", color: "purple" },
  DISCUSSION: { label: "Discussão", icon: "Users", color: "indigo" },
} as const

export const REPORT_REASONS = {
  SPAM: "Spam",
  HARASSMENT: "Assédio",
  HATE_SPEECH: "Discurso de ódio",
  MISINFORMATION: "Desinformação",
  SELF_HARM: "Conteúdo prejudicial",
  INAPPROPRIATE: "Inapropriado",
  OTHER: "Outro",
} as const

export const REPORT_STATUS_LABELS = {
  PENDING: "Pendente",
  REVIEWING: "Em análise",
  RESOLVED: "Resolvido",
  DISMISSED: "Dispensado",
} as const
