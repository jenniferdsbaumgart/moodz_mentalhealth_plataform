import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, text } from "../styles"

interface TherapistApprovedEmailProps {
  userName: string
  dashboardUrl: string
  profileUrl: string
  patientsUrl: string
}

export function TherapistApprovedEmail({
  userName,
  dashboardUrl,
  profileUrl,
  patientsUrl,
}: TherapistApprovedEmailProps) {
  return (
    <BaseTemplate preview="Parabéns! Seu perfil foi aprovado">
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        🎉 Parabéns! Você foi Aprovado
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Temos ótimas notícias! Após revisar seu perfil e credenciais, seu cadastro como terapeuta na Moodz foi <strong>aprovado</strong>.
      </Text>

      <Text style={text}>
        Agora você pode:
      </Text>

      <ul style={{ color: "#333", fontSize: "16px", lineHeight: "24px", margin: "16px 0", paddingLeft: "20px" }}>
        <li>Começar a atender pacientes</li>
        <li>Gerenciar suas sessões e horários</li>
        <li>Acompanhar o progresso dos pacientes</li>
        <li>Usar ferramentas avançadas de analytics</li>
        <li>Receber pagamentos pelas sessões</li>
      </ul>

      <Text style={text}>
        Aqui estão os próximos passos para começar:
      </Text>

      <ol style={{ color: "#333", fontSize: "16px", lineHeight: "24px", margin: "16px 0", paddingLeft: "20px" }}>
        <li>Configure sua disponibilidade no calendário</li>
        <li>Personalize seu perfil público</li>
        <li>Defina suas tarifas e preferências</li>
        <li>Comece a receber pacientes!</li>
      </ol>

      <Button style={button} href={dashboardUrl}>
        Acessar Dashboard do Terapeuta
      </Button>

      <Button
        style={{
          ...button,
          backgroundColor: "#6B7280",
          marginLeft: "12px"
        }}
        href={profileUrl}
      >
        Configurar Perfil
      </Button>

      <Text style={text}>
        Seja bem-vindo à nossa comunidade de profissionais! Estamos ansiosos para ver o impacto positivo que você terá na vida dos seus pacientes.
      </Text>

      <Text style={text}>
        Qualquer dúvida, nossa equipe de suporte está à disposição.
      </Text>
    </BaseTemplate>
  )
}
