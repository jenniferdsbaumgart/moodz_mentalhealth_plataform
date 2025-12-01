import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Calcula o tempo estimado de leitura baseado no conteúdo
 * Assumindo 200 palavras por minuto (média de leitura em português)
 */
export function calculateReadingTime(content: string): number {
  // Remove tags HTML para contar apenas o texto
  const textContent = stripHtml(content)

  // Conta palavras (dividindo por espaços e removendo caracteres especiais)
  const words = textContent
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length

  // Calcula minutos baseado em 200 palavras por minuto
  const minutes = Math.ceil(words / 200)

  // Retorna pelo menos 1 minuto
  return Math.max(1, minutes)
}

/**
 * Remove tags HTML do conteúdo, preservando quebras de linha
 */
export function stripHtml(html: string): string {
  if (!html) return ""

  return html
    .replace(/<[^>]*>/g, "") // Remove tags HTML
    .replace(/&nbsp;/g, " ") // Substitui &nbsp;
    .replace(/&amp;/g, "&") // Substitui entidades HTML comuns
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Remove espaços extras
    .trim()
}

/**
 * Gera slug a partir do título
 * Converte para lowercase, remove acentos, substitui espaços por hífens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais (exceto espaços e hífens)
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens consecutivos
    .replace(/^-|-$/g, "") // Remove hífens no início e fim
}

/**
 * Extrai excerpt do conteúdo (primeiro parágrafo ou primeiras 150 palavras)
 */
export function extractExcerpt(content: string, maxLength: number = 150): string {
  if (!content) return ""

  // Remove tags HTML
  const textContent = stripHtml(content)

  // Divide em parágrafos (por quebras de linha duplas ou tags <p>)
  const paragraphs = textContent
    .split(/\n\s*\n/) // Quebras de linha duplas
    .filter(p => p.trim().length > 0)

  // Se tem parágrafos, usa o primeiro
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0].trim()
    if (firstParagraph.length <= maxLength) {
      return firstParagraph
    }
  }

  // Caso contrário, usa as primeiras palavras
  const words = textContent.split(/\s+/).filter(word => word.length > 0)
  const excerptWords = words.slice(0, Math.ceil(maxLength / 6)) // ~6 chars por palavra média
  let excerpt = excerptWords.join(" ")

  // Adiciona reticências se foi truncado
  if (excerpt.length < textContent.length) {
    excerpt += "..."
  }

  return excerpt
}

/**
 * Formata data para exibição em português brasileiro
 */
export function formatBlogDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date

  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata data relativa (ex: "há 2 dias", "em 3 dias")
 */
export function formatRelativeBlogDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  const now = new Date()
  const diffInMs = dateObj.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffInDays) <= 7) {
    if (diffInDays === 0) return "hoje"
    if (diffInDays === 1) return "amanhã"
    if (diffInDays === -1) return "ontem"
    if (diffInDays > 0) return `em ${diffInDays} dias`
    return `há ${Math.abs(diffInDays)} dias`
  }

  return formatBlogDate(dateObj)
}

/**
 * Valida se uma string é um slug válido
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith("-") && !slug.endsWith("-")
}

/**
 * Sanitiza HTML removendo tags perigosas, mantendo apenas formatação básica
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // Lista de tags permitidas (formatação básica)
  const allowedTags = [
    "p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote", "a", "img", "code", "pre"
  ]

  // Remove tags não permitidas e atributos perigosos
  let sanitized = html
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gi, "") // Remove estilos inline
    .replace(/on\w+="[^"]*"/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: URLs

  // Mantém apenas tags permitidas (simplificado - em produção usar biblioteca dedicada)
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : ""
  })

  return sanitized
}

/**
 * Conta palavras em um texto (útil para estatísticas)
 */
export function countWords(text: string): number {
  if (!text) return 0

  return text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

/**
 * Gera meta description para SEO baseada no excerpt
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const excerpt = extractExcerpt(content, maxLength)

  // Remove reticências se existir
  return excerpt.replace(/\.\.\.$/, "").trim()
}

