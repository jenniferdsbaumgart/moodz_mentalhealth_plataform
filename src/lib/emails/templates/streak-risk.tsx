import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface StreakRiskEmailProps {
  userName: string
  currentStreak: number
  lastCheckInDate: string
  hoursRemaining: number
}

export function StreakRiskEmail({
  userName,
  currentStreak,
  lastCheckInDate,
  hoursRemaining,
}: StreakRiskEmailProps) {
  return (
    <BaseTemplate preview={`🔥 Sua sequência de ${currentStreak} dias está em risco!`}>
      <Heading style={h1}>🔥 Sua Sequência Está em Risco!</Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Notamos que você ainda não fez seu check-in de hoje. Sua incrível sequência de{" "}
        <strong>{currentStreak} dias</strong> está em risco!
      </Text>

      <div style={{
        backgroundColor: "#fef3c7",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
        textAlign: "center" as const
      }}>
        <Text style={{ 
          ...text, 
          margin: "0 0 8px 0",
          fontSize: "48px",
          fontWeight: "bold",
          color: "#f59e0b"
        }}>
          🔥 {currentStreak}
        </Text>
        <Text style={{ ...text, margin: "0", fontWeight: "bold" }}>
          dias consecutivos
        </Text>
        <Text style={{ ...text, margin: "8px 0 0 0", fontSize: "14px", color: "#666" }}>
          Último check-in: {lastCheckInDate}
        </Text>
      </div>

      <div style={{
        backgroundColor: "#fee2e2",
        padding: "16px",
        borderRadius: "8px",
        margin: "20px 0",
        textAlign: "center" as const
      }}>
        <Text style={{ ...text, margin: "0", color: "#ef4444", fontWeight: "bold" }}>
          ⏰ Restam apenas {hoursRemaining} hora{hoursRemaining !== 1 ? "s" : ""} para manter sua sequência!
        </Text>
      </div>

      <Text style={text}>
        Manter uma rotina de check-in diário ajuda você a:
      </Text>
      <ul style={{ ...text, paddingLeft: "20px" }}>
        <li>Acompanhar seu progresso emocional</li>
        <li>Identificar padrões de humor</li>
        <li>Desenvolver autoconsciência</li>
        <li>Ganhar pontos e badges exclusivos</li>
      </ul>

      <Button style={{ ...button, backgroundColor: "#f59e0b" }} href="https://moodz.com/wellness/daily-checkin">
        Fazer Check-in Agora
      </Button>

      <Text style={{ ...text, fontSize: "14px", color: "#666" }}>
        Leva menos de 1 minuto! Não deixe sua sequência acabar. 💪
      </Text>
    </BaseTemplate>
  )
}

