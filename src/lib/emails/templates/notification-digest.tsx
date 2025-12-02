import {
  Button,
  Heading,
  Text,
  Hr,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface NotificationItem {
  title: string
  message: string
  type: string
  createdAt: Date | string
  link?: string
}

interface NotificationDigestEmailProps {
  userName: string
  notifications: NotificationItem[]
  digestType: "daily" | "weekly"
  periodStart: string
  periodEnd: string
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    SESSION_REMINDER: "📅",
    SESSION_STARTING: "⏰",
    SESSION_CANCELLED: "❌",
    SESSION_REMINDER_THERAPIST: "📅",
    NEW_ENROLLMENT: "👤",
    NEW_MESSAGE: "💬",
    NEW_BADGE: "🏆",
    STREAK_RISK: "🔥",
    STREAK_ACHIEVED: "🎉",
    NEW_POST_REPLY: "💬",
    POST_UPVOTED: "👍",
    THERAPIST_APPROVED: "✅",
    NEW_REVIEW: "⭐",
    PATIENT_MILESTONE: "🎯",
    SYSTEM_ANNOUNCEMENT: "📢",
    WEEKLY_SUMMARY: "📊",
  }
  return icons[type] || "🔔"
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    SESSION_REMINDER: "#3b82f6",
    SESSION_STARTING: "#ef4444",
    SESSION_CANCELLED: "#6b7280",
    SESSION_REMINDER_THERAPIST: "#3b82f6",
    NEW_ENROLLMENT: "#8b5cf6",
    NEW_MESSAGE: "#10b981",
    NEW_BADGE: "#f59e0b",
    STREAK_RISK: "#f97316",
    STREAK_ACHIEVED: "#22c55e",
    NEW_POST_REPLY: "#10b981",
    POST_UPVOTED: "#10b981",
    THERAPIST_APPROVED: "#14b8a6",
    NEW_REVIEW: "#6366f1",
    PATIENT_MILESTONE: "#ec4899",
    SYSTEM_ANNOUNCEMENT: "#a855f7",
    WEEKLY_SUMMARY: "#06b6d4",
  }
  return colors[type] || "#6b7280"
}

const groupNotificationsByType = (notifications: NotificationItem[]) => {
  const groups: Record<string, NotificationItem[]> = {}
  
  notifications.forEach(notification => {
    const type = notification.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(notification)
  })
  
  return groups
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export function NotificationDigestEmail({
  userName,
  notifications,
  digestType,
  periodStart,
  periodEnd,
}: NotificationDigestEmailProps) {
  const groupedNotifications = groupNotificationsByType(notifications)
  const totalCount = notifications.length
  const periodLabel = digestType === "daily" ? "nas últimas 24 horas" : "na última semana"

  return (
    <BaseTemplate preview={`${totalCount} notificações ${periodLabel}`}>
      <Heading style={h1}>
        {digestType === "daily" ? "📬 Resumo Diário" : "📬 Resumo Semanal"}
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Aqui está o seu resumo de notificações {periodLabel}. 
        Você tem <strong>{totalCount} notificação{totalCount !== 1 ? "ões" : ""}</strong> para conferir.
      </Text>

      <Text style={{ ...text, fontSize: "12px", color: "#666" }}>
        Período: {periodStart} - {periodEnd}
      </Text>

      <Hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />

      {/* Summary by type */}
      <div style={{
        backgroundColor: "#f8fafc",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px"
      }}>
        <Text style={{ ...text, margin: "0 0 12px 0", fontWeight: "bold" }}>
          Resumo por categoria:
        </Text>
        {Object.entries(groupedNotifications).map(([type, items]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ marginRight: "8px" }}>{getTypeIcon(type)}</span>
            <span style={{ 
              color: getTypeColor(type), 
              fontWeight: "500",
              fontSize: "14px"
            }}>
              {items.length}x {type.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed notifications */}
      <Text style={{ ...text, fontWeight: "bold", marginBottom: "16px" }}>
        Detalhes das notificações:
      </Text>

      {notifications.slice(0, 10).map((notification, index) => (
        <div 
          key={index}
          style={{
            padding: "12px",
            borderLeft: `3px solid ${getTypeColor(notification.type)}`,
            backgroundColor: "#fafafa",
            marginBottom: "12px",
            borderRadius: "0 6px 6px 0"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>{getTypeIcon(notification.type)}</span>
            <div style={{ flex: 1 }}>
              <Text style={{ 
                ...text, 
                margin: "0 0 4px 0", 
                fontWeight: "600",
                fontSize: "14px"
              }}>
                {notification.title}
              </Text>
              <Text style={{ 
                ...text, 
                margin: "0 0 4px 0",
                fontSize: "13px",
                color: "#4b5563"
              }}>
                {notification.message}
              </Text>
              <Text style={{ 
                ...text, 
                margin: "0",
                fontSize: "11px",
                color: "#9ca3af"
              }}>
                {formatDate(notification.createdAt)}
              </Text>
            </div>
          </div>
        </div>
      ))}

      {notifications.length > 10 && (
        <Text style={{ ...text, fontStyle: "italic", color: "#666", textAlign: "center" as const }}>
          ... e mais {notifications.length - 10} notificação{notifications.length - 10 !== 1 ? "ões" : ""}
        </Text>
      )}

      <Hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />

      <Button style={button} href="https://moodz.com/notifications">
        Ver Todas as Notificações
      </Button>

      <Text style={{ ...text, fontSize: "12px", color: "#666", marginTop: "24px" }}>
        💡 <strong>Dica:</strong> Você pode alterar a frequência do resumo nas{" "}
        <a href="https://moodz.com/settings/notifications" style={{ color: "#4F46E5" }}>
          configurações de notificação
        </a>.
      </Text>
    </BaseTemplate>
  )
}

