import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, text, link } from "../styles"

interface EmailVerificationProps {
  userName: string
  verificationUrl: string
}

export function EmailVerificationEmail({
  userName,
  verificationUrl,
}: EmailVerificationProps) {
  return (
    <BaseTemplate preview="Verifique seu email para ativar sua conta Moodz">
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        Verifique seu Email 📧
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Obrigado por se cadastrar na Moodz! Para completar seu registro e começar a usar a plataforma, 
        por favor verifique seu endereço de email clicando no botão abaixo:
      </Text>

      <Button style={button} href={verificationUrl}>
        Verificar Email
      </Button>

      <Text style={text}>
        Ou copie e cole o link abaixo no seu navegador:
      </Text>

      <Text style={{ ...text, wordBreak: "break-all", fontSize: "14px", color: "#666" }}>
        <a href={verificationUrl} style={link}>
          {verificationUrl}
        </a>
      </Text>

      <Text style={{ ...text, backgroundColor: "#FEF3C7", padding: "12px", borderRadius: "6px", fontSize: "14px" }}>
        ⚠️ Este link expira em 24 horas. Se você não solicitou esta verificação, 
        pode ignorar este email com segurança.
      </Text>

      <Text style={text}>
        Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está 
        sempre disponível para ajudá-lo.
      </Text>

      <Text style={text}>
        Bem-vindo à Moodz! 🌟
      </Text>
    </BaseTemplate>
  )
}

