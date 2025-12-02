import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, text } from "../styles"

interface NewBadgeEmailProps {
  userName: string
  badgeName: string
  badgeDescription: string
  badgeIcon?: string
  totalBadges: number
  dashboardUrl: string
  badgesUrl: string
}

export function NewBadgeEmail({
  userName,
  badgeName,
  badgeDescription,
  badgeIcon,
  totalBadges,
  dashboardUrl,
  badgesUrl,
}: NewBadgeEmailProps) {
  return (
    <BaseTemplate preview={`Parabéns! Você conquistou o badge "${badgeName}"`}>
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        🏆 Novo Badge Conquistado!
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Parabéns! Você acaba de conquistar um novo badge na Moodz:
      </Text>

      {/* Badge Display */}
      <div style={{
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "24px",
        margin: "24px 0",
        textAlign: "center",
        border: "2px solid #4F46E5"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>
          {badgeIcon || "🏆"}
        </div>
        <Heading style={{
          color: "#4F46E5",
          fontSize: "28px",
          fontWeight: "bold",
          margin: "0 0 8px 0",
          padding: "0"
        }}>
          {badgeName}
        </Heading>
        <Text style={{ ...text, margin: "0", fontSize: "16px" }}>
          {badgeDescription}
        </Text>
      </div>

      <Text style={text}>
        Você agora tem <strong>{totalBadges}</strong> badge{totalBadges !== 1 ? 's' : ''} conquistado{totalBadges !== 1 ? 's' : ''}!
        Continue sua jornada de crescimento pessoal e desbloqueie ainda mais conquistas.
      </Text>

      <Text style={text}>
        Cada badge representa um marco importante na sua jornada de saúde mental. Continue assim! 🌟
      </Text>

      <Button style={button} href={badgesUrl}>
        Ver Todos os Badges
      </Button>

      <Button
        style={{
          ...button,
          backgroundColor: "#6B7280",
          marginLeft: "12px"
        }}
        href={dashboardUrl}
      >
        Ver Dashboard
      </Button>

      <Text style={text}>
        Lembre-se: seu progresso é único e válido. Cada pequeno passo conta para sua transformação pessoal.
      </Text>
    </BaseTemplate>
  )
}

