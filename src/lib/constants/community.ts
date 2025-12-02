import { PostCategory, ReportReason, ReportStatus } from "@prisma/client"

export const POST_CATEGORIES = {
  [PostCategory.GENERAL]: {
    label: "Geral",
    icon: "MessageCircle",
    color: "gray",
    description: "Discussões gerais sobre saúde mental"
  },
  [PostCategory.EXPERIENCES]: {
    label: "Experiências",
    icon: "BookOpen",
    color: "blue",
    description: "Compartilhe suas experiências pessoais"
  },
  [PostCategory.QUESTIONS]: {
    label: "Perguntas",
    icon: "HelpCircle",
    color: "green",
    description: "Tire suas dúvidas sobre saúde mental"
  },
  [PostCategory.SUPPORT]: {
    label: "Suporte",
    icon: "Heart",
    color: "red",
    description: "Ofereça e receba suporte emocional"
  },
  [PostCategory.VICTORIES]: {
    label: "Vitórias",
    icon: "Trophy",
    color: "yellow",
    description: "Celebre conquistas e progressos"
  },
  [PostCategory.RESOURCES]: {
    label: "Recursos",
    icon: "Link",
    color: "purple",
    description: "Compartilhe recursos úteis e materiais"
  },
  [PostCategory.DISCUSSION]: {
    label: "Discussão",
    icon: "Users",
    color: "indigo",
    description: "Debates e discussões sobre temas diversos"
  },
} as const

export const REPORT_REASONS = {
  [ReportReason.SPAM]: {
    label: "Spam",
    description: "Conteúdo promocional ou repetitivo não solicitado"
  },
  [ReportReason.HARASSMENT]: {
    label: "Assédio",
    description: "Comportamento intimidatório ou ameaçador"
  },
  [ReportReason.HATE_SPEECH]: {
    label: "Discurso de ódio",
    description: "Conteúdo discriminatório baseado em raça, gênero, orientação sexual, etc."
  },
  [ReportReason.MISINFORMATION]: {
    label: "Desinformação",
    description: "Informações falsas ou enganosas sobre saúde mental"
  },
  [ReportReason.SELF_HARM]: {
    label: "Conteúdo prejudicial",
    description: "Conteúdo que promove ou descreve autoagressão"
  },
  [ReportReason.INAPPROPRIATE]: {
    label: "Inapropriado",
    description: "Conteúdo sexual, violento ou inadequado para a comunidade"
  },
  [ReportReason.OTHER]: {
    label: "Outro",
    description: "Outro motivo não listado acima"
  },
} as const

export const REPORT_STATUS_CONFIG = {
  [ReportStatus.PENDING]: {
    label: "Pendente",
    color: "yellow",
    description: "Relatório aguardando análise"
  },
  [ReportStatus.REVIEWING]: {
    label: "Em análise",
    color: "blue",
    description: "Relatório sendo analisado por moderadores"
  },
  [ReportStatus.RESOLVED]: {
    label: "Resolvido",
    color: "green",
    description: "Relatório resolvido e ação tomada"
  },
  [ReportStatus.DISMISSED]: {
    label: "Dispensado",
    color: "gray",
    description: "Relatório considerado infundado"
  },
} as const

export const COMMUNITY_SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'popular', label: 'Mais votados' },
  { value: 'mostCommented', label: 'Mais comentados' },
] as const

export const COMMUNITY_DEFAULTS = {
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50,
  MAX_TAGS_PER_POST: 5,
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MAX_COMMENT_LENGTH: 2000,
  MAX_REPORT_DESCRIPTION_LENGTH: 500,
  MAX_TAG_NAME_LENGTH: 30,
  MIN_SEARCH_LENGTH: 3,
} as const

export const COMMUNITY_RULES = [
  "Seja respeitoso e empático com todos os membros",
  "Não compartilhe informações pessoais identificáveis",
  "Evite dar conselhos médicos específicos - consulte profissionais",
  "Não promova conteúdo prejudicial ou perigoso",
  "Use as tags apropriadas para categorizar seu post",
  "Relate conteúdo inadequado através do sistema de denúncias",
  "Mantenha discussões construtivas e positivas",
] as const

export const VOTE_VALUES = {
  UP: 1,
  DOWN: -1,
} as const

export const VOTE_LABELS = {
  [VOTE_VALUES.UP]: "Útil",
  [VOTE_VALUES.DOWN]: "Não útil",
} as const



