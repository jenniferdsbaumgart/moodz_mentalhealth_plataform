/**
 * Design Tokens - Moodz
 *
 * Use estas constantes para manter consistência visual.
 * Importe e use ao invés de valores hardcoded.
 */

// Espaçamentos de página
export const PAGE_SPACING = {
  /** Espaço entre seções principais da página */
  sections: "space-y-8",
  /** Espaço dentro de seções/cards */
  content: "space-y-6",
  /** Espaço entre itens de lista */
  items: "space-y-4",
  /** Espaço entre elementos inline */
  inline: "space-x-2",
  /** Espaço em grids */
  grid: "gap-6",
  /** Padding de página */
  pagePadding: "p-6 md:p-8",
  /** Padding de cards */
  cardPadding: "p-6",
} as const

// Tamanhos de container
export const CONTAINER = {
  /** Largura máxima para conteúdo de leitura */
  prose: "max-w-3xl",
  /** Largura máxima para formulários */
  form: "max-w-2xl",
  /** Largura máxima para dashboards */
  dashboard: "max-w-7xl",
  /** Largura máxima para landing pages */
  landing: "max-w-6xl",
} as const

// Variantes de botão por contexto
export const BUTTON_VARIANTS = {
  /** Ação principal da página */
  primary: "default",
  /** Ações secundárias */
  secondary: "outline",
  /** Ações destrutivas */
  destructive: "destructive",
  /** Links/navegação */
  link: "ghost",
  /** Ações em cards/listas */
  subtle: "ghost",
} as const

// Tamanhos de texto
export const TEXT_SIZES = {
  /** Título de página */
  pageTitle: "text-3xl font-bold tracking-tight",
  /** Título de seção */
  sectionTitle: "text-xl font-semibold",
  /** Título de card */
  cardTitle: "text-lg font-medium",
  /** Texto de corpo */
  body: "text-base",
  /** Texto secundário/muted */
  muted: "text-sm text-muted-foreground",
  /** Labels de formulário */
  label: "text-sm font-medium",
} as const

// Transições
export const TRANSITIONS = {
  /** Transição padrão */
  default: "transition-all duration-200",
  /** Transição rápida (hovers) */
  fast: "transition-all duration-150",
  /** Transição lenta (modais) */
  slow: "transition-all duration-300",
} as const

// Estados de hover para cards
export const CARD_HOVER = {
  /** Card interativo padrão */
  interactive: "hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer",
  /** Card com elevação */
  elevated: "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
  /** Card com destaque de borda */
  bordered: "hover:border-primary transition-colors duration-200",
} as const

// Breakpoints (para referência)
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const


