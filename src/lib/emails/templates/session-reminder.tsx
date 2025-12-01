import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, container, h1, main, text } from "../styles"

interface SessionReminderEmailProps {
  userName: string
  sessionTitle: string
  sessionDate: string
  sessionTime: string
  therapistName: string
  joinUrl: string
}

export function SessionReminderEmail({
  userName,
  sessionTitle,
  sessionDate,
  sessionTime,
  therapistName,
  joinUrl,
}: SessionReminderEmailProps) {
  return (
    <BaseTemplate preview="Sua sessão começa em 1 hora">
      <Heading style={h1}>Lembrete de Sessão</Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Este é um lembrete de que sua sessão de terapia está programada para começar em 1 hora.
      </Text>

      <Text style={text}>
        <strong>Sessão:</strong> {sessionTitle}<br />
        <strong>Terapeuta:</strong> {therapistName}<br />
        <strong>Data:</strong> {sessionDate}<br />
        <strong>Horário:</strong> {sessionTime}
      </Text>

      <Button style={button} href={joinUrl}>
        Entrar na Sessão
      </Button>

      <Text style={text}>
        Se você não conseguir participar, entre em contato com seu terapeuta ou cancele a sessão através da plataforma.
      </Text>

      <Text style={text}>
        Lembre-se: sua saúde mental é importante. Até logo!
      </Text>
    </BaseTemplate>
  )
}
