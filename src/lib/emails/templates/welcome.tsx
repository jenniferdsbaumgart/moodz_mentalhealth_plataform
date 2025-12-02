import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, text } from "../styles"

interface WelcomeEmailProps {
  userName: string
  userType: "patient" | "therapist"
  dashboardUrl: string
  profileUrl: string
}

export function WelcomeEmail({
  userName,
  userType,
  dashboardUrl,
  profileUrl,
}: WelcomeEmailProps) {
  const userTypeText = userType === "therapist" ? "terapeuta" : "paciente"

  return (
    <BaseTemplate preview={`Bem-vindo à Moodz, ${userName}!`}>
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        Bem-vindo à Moodz! 🎉
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Bem-vindo à Moodz! Estamos muito felizes em ter você como {userTypeText} em nossa plataforma de saúde mental.
      </Text>

      <Text style={text}>
        Aqui você encontrará:
      </Text>

      <ul style={{ color: "#333", fontSize: "16px", lineHeight: "24px", margin: "16px 0", paddingLeft: "20px" }}>
        {userType === "patient" ? (
          <>
            <li>Sessões de terapia personalizadas</li>
            <li>Acompanhamento do seu bem-estar</li>
            <li>Conteúdo educativo sobre saúde mental</li>
            <li>Comunidade de apoio</li>
          </>
        ) : (
          <>
            <li>Ferramentas para gerenciar sessões</li>
            <li>Recursos para acompanhar pacientes</li>
            <li>Analytics e relatórios</li>
            <li>Suporte administrativo</li>
          </>
        )}
      </ul>

      <Text style={text}>
        Para começar, complete seu perfil e explore a plataforma:
      </Text>

      <Button style={button} href={profileUrl}>
        Completar Perfil
      </Button>

      <Button
        style={{
          ...button,
          backgroundColor: "#6B7280",
          marginLeft: "12px"
        }}
        href={dashboardUrl}
      >
        Explorar Dashboard
      </Button>

      <Text style={text}>
        Se tiver alguma dúvida, nossa equipe está aqui para ajudar. Basta responder este email ou acessar nosso suporte na plataforma.
      </Text>

      <Text style={text}>
        Bem-vindo à jornada da sua saúde mental! 🌟
      </Text>
    </BaseTemplate>
  )
}

