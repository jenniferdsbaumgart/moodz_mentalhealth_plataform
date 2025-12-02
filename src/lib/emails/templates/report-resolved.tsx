import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface ReportResolvedEmailProps {
  userName: string
  reportType: string // "post" | "comment" | "user"
  contentPreview?: string
  resolution: "approved" | "rejected" | "content_removed" | "user_warned" | "user_banned"
  moderatorNote?: string
  reportDate: string
  resolvedDate: string
}

const RESOLUTION_MESSAGES = {
  approved: {
    title: "Denúncia Aprovada",
    message: "Sua denúncia foi analisada e aprovada. A ação apropriada foi tomada.",
    color: "#10b981"
  },
  rejected: {
    title: "Denúncia Não Procedente",
    message: "Após análise, não foi identificada violação das diretrizes da comunidade.",
    color: "#6b7280"
  },
  content_removed: {
    title: "Conteúdo Removido",
    message: "O conteúdo denunciado foi removido por violar as diretrizes da comunidade.",
    color: "#10b981"
  },
  user_warned: {
    title: "Usuário Advertido",
    message: "O usuário recebeu uma advertência sobre seu comportamento.",
    color: "#f59e0b"
  },
  user_banned: {
    title: "Usuário Banido",
    message: "O usuário foi banido da plataforma por violações graves.",
    color: "#ef4444"
  }
}

export function ReportResolvedEmail({
  userName,
  reportType,
  contentPreview,
  resolution,
  moderatorNote,
  reportDate,
  resolvedDate,
}: ReportResolvedEmailProps) {
  const resolutionInfo = RESOLUTION_MESSAGES[resolution]
  
  const reportTypeLabel = {
    post: "Post",
    comment: "Comentário",
    user: "Usuário"
  }[reportType] || reportType

  return (
    <BaseTemplate preview={`Denúncia resolvida - ${resolutionInfo.title}`}>
      <Heading style={h1}>Denúncia Resolvida</Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Sua denúncia foi analisada pela nossa equipa de moderação. Agradecemos por ajudar 
        a manter nossa comunidade segura e acolhedora.
      </Text>

      <div style={{
        backgroundColor: "#f8f8f8",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
        borderLeft: `4px solid ${resolutionInfo.color}`
      }}>
        <Text style={{ ...text, margin: "0 0 12px 0", fontWeight: "bold", color: resolutionInfo.color }}>
          {resolutionInfo.title}
        </Text>
        
        <Text style={{ ...text, margin: "0 0 12px 0" }}>
          {resolutionInfo.message}
        </Text>

        <Text style={{ ...text, margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
          <strong>Tipo:</strong> {reportTypeLabel}
        </Text>
        
        <Text style={{ ...text, margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
          <strong>Data da denúncia:</strong> {reportDate}
        </Text>
        
        <Text style={{ ...text, margin: "0", fontSize: "14px", color: "#666" }}>
          <strong>Data da resolução:</strong> {resolvedDate}
        </Text>
      </div>

      {contentPreview && (
        <div style={{
          backgroundColor: "#fff3cd",
          padding: "12px",
          borderRadius: "6px",
          margin: "16px 0"
        }}>
          <Text style={{ ...text, margin: "0", fontSize: "14px" }}>
            <strong>Conteúdo denunciado:</strong><br />
            <em>"{contentPreview.substring(0, 200)}{contentPreview.length > 200 ? "..." : ""}"</em>
          </Text>
        </div>
      )}

      {moderatorNote && (
        <Text style={{ ...text, fontStyle: "italic", color: "#666" }}>
          <strong>Nota do moderador:</strong> {moderatorNote}
        </Text>
      )}

      <Text style={text}>
        Se tiver alguma dúvida sobre esta decisão, pode entrar em contato com nosso suporte.
      </Text>

      <Button style={button} href="https://moodz.com/community">
        Voltar à Comunidade
      </Button>
    </BaseTemplate>
  )
}

