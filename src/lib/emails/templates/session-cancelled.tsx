import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface SessionCancelledEmailProps {
  userName: string
  sessionTitle: string
  sessionDate: string
  sessionTime: string
  therapistName: string
  reason?: string
}

export function SessionCancelledEmail({
  userName,
  sessionTitle,
  sessionDate,
  sessionTime,
  therapistName,
  reason,
}: SessionCancelledEmailProps) {
  return (
    <BaseTemplate preview={`Sessão cancelada - ${sessionTitle}`}>
      <Heading style={h1}>Sessão Cancelada</Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Infelizmente, a sessão <strong>"{sessionTitle}"</strong> com {therapistName} foi cancelada.
      </Text>

      <Text style={text}>
        <strong>Data programada:</strong> {sessionDate}<br />
        <strong>Horário:</strong> {sessionTime}
      </Text>

      {reason && (
        <Text style={{ ...text, backgroundColor: "#f8f8f8", padding: "12px", borderRadius: "6px" }}>
          <strong>Motivo:</strong> {reason}
        </Text>
      )}

      <Text style={text}>
        Sabemos que isso pode ser frustrante. Você pode encontrar outras sessões disponíveis na plataforma 
        ou reagendar com o mesmo terapeuta quando houver disponibilidade.
      </Text>

      <Button style={button} href="https://moodz.com/sessions">
        Ver Sessões Disponíveis
      </Button>

      <Text style={text}>
        Se você tiver alguma dúvida, não hesite em entrar em contato com nosso suporte.
      </Text>
    </BaseTemplate>
  )
}

