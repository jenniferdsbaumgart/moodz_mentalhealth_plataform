import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, text } from "../styles"

interface SessionStartingEmailProps {
  userName: string
  sessionTitle: string
  therapistName: string
  joinUrl: string
}

export function SessionStartingEmail({
  userName,
  sessionTitle,
  therapistName,
  joinUrl,
}: SessionStartingEmailProps) {
  return (
    <BaseTemplate preview="Sua sessão está começando agora">
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        Sessão Começando Agora
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Sua sessão "{sessionTitle}" com {therapistName} está prestes a começar.
      </Text>

      <Text style={text}>
        Clique no botão abaixo para entrar na sessão:
      </Text>

      <Button style={button} href={joinUrl}>
        Entrar na Sessão Agora
      </Button>

      <Text style={text}>
        <strong>Importante:</strong> Certifique-se de ter uma conexão estável com a internet e um ambiente tranquilo para a sessão.
      </Text>
    </BaseTemplate>
  )
}

