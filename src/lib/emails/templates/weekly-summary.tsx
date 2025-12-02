import {
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { text } from "../styles"

interface WeeklySummaryEmailProps {
  userName: string
  userType: "patient" | "therapist"
  weekStart: string
  weekEnd: string
  stats: {
    sessionsAttended?: number
    sessionsConducted?: number
    moodEntries?: number
    exercisesCompleted?: number
    badgesEarned?: number
    patientsHelped?: number
  }
  highlights?: string[]
  nextWeek?: string[]
}

export function WeeklySummaryEmail({
  userName,
  userType,
  weekStart,
  weekEnd,
  stats,
  highlights = [],
  nextWeek = [],
}: WeeklySummaryEmailProps) {
  const isTherapist = userType === "therapist"

  return (
    <BaseTemplate preview={`Seu resumo semanal - ${weekStart} a ${weekEnd}`}>
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        📊 Seu Resumo Semanal
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Aqui está um resumo da sua atividade na Moodz de {weekStart} a {weekEnd}:
      </Text>

      {/* Stats Grid */}
      <div style={{
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        padding: "24px",
        margin: "24px 0",
        border: "1px solid #e2e8f0"
      }}>
        <Text style={{ ...text, fontSize: "18px", fontWeight: "bold", margin: "0 0 16px 0" }}>
          📈 Estatísticas da Semana
        </Text>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {isTherapist ? (
            <>
              <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#4F46E5", margin: "0 0 4px 0" }}>
                  {stats.sessionsConducted || 0}
                </Text>
                <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                  Sessões Realizadas
                </Text>
              </div>
              <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", margin: "0 0 4px 0" }}>
                  {stats.patientsHelped || 0}
                </Text>
                <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                  Pacientes Atendidos
                </Text>
              </div>
            </>
          ) : (
            <>
              <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#4F46E5", margin: "0 0 4px 0" }}>
                  {stats.sessionsAttended || 0}
                </Text>
                <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                  Sessões Participadas
                </Text>
              </div>
              <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#059669", margin: "0 0 4px 0" }}>
                  {stats.exercisesCompleted || 0}
                </Text>
                <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                  Exercícios Completados
                </Text>
              </div>
            </>
          )}

          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#DC2626", margin: "0 0 4px 0" }}>
              {stats.badgesEarned || 0}
            </Text>
            <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
              Badges Conquistados
            </Text>
          </div>

          {!isTherapist && (
            <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#7C3AED", margin: "0 0 4px 0" }}>
                {stats.moodEntries || 0}
              </Text>
              <Text style={{ fontSize: "14px", color: "#64748b", margin: "0" }}>
                Registros de Humor
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <Text style={{ ...text, fontSize: "18px", fontWeight: "bold", margin: "0 0 12px 0" }}>
            ✨ Destaques da Semana
          </Text>
          <ul style={{ color: "#333", fontSize: "16px", lineHeight: "24px", margin: "0", paddingLeft: "20px" }}>
            {highlights.map((highlight, index) => (
              <li key={index} style={{ margin: "8px 0" }}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Week */}
      {nextWeek.length > 0 && (
        <div style={{ margin: "24px 0" }}>
          <Text style={{ ...text, fontSize: "18px", fontWeight: "bold", margin: "0 0 12px 0" }}>
            🎯 Para a Próxima Semana
          </Text>
          <ul style={{ color: "#333", fontSize: "16px", lineHeight: "24px", margin: "0", paddingLeft: "20px" }}>
            {nextWeek.map((item, index) => (
              <li key={index} style={{ margin: "8px 0" }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <Text style={text}>
        Continue cuidando da sua saúde mental. Estamos aqui para apoiar sua jornada! 🌟
      </Text>

      <Text style={{ ...text, fontSize: "14px", color: "#64748b" }}>
        Você pode ajustar suas preferências de notificação ou cancelar estes emails nas configurações da sua conta.
      </Text>
    </BaseTemplate>
  )
}

