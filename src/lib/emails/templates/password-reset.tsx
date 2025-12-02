import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, code, text } from "../styles"

interface PasswordResetEmailProps {
  userName: string
  resetUrl: string
  resetCode?: string
  expiresIn: string
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  resetCode,
  expiresIn,
}: PasswordResetEmailProps) {
  return (
    <BaseTemplate preview="Redefina sua senha - Moodz">
      <Heading style={{ color: "#333", fontSize: "24px", fontWeight: "bold", margin: "40px 0 20px", padding: "0" }}>
        🔐 Redefinição de Senha
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        Recebemos uma solicitação para redefinir a senha da sua conta na Moodz.
      </Text>

      <Text style={text}>
        Para redefinir sua senha, clique no botão abaixo:
      </Text>

      <Button style={button} href={resetUrl}>
        Redefinir Senha
      </Button>

      {resetCode && (
        <div style={{ margin: "24px 0", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <Text style={{ ...text, margin: "0 0 8px 0", fontWeight: "bold" }}>
            Ou use este código de verificação:
          </Text>
          <div style={code}>
            {resetCode}
          </div>
        </div>
      )}

      <Text style={text}>
        Este link/código é válido por {expiresIn}. Se você não solicitou esta redefinição, ignore este email.
      </Text>

      <Text style={text}>
        <strong>Importante:</strong> Nunca compartilhe este link ou código com terceiros.
      </Text>

      <Text style={text}>
        Se o botão não funcionar, copie e cole este link no seu navegador:
        <br />
        <a href={resetUrl} style={{ color: "#4F46E5", wordBreak: "break-all" }}>
          {resetUrl}
        </a>
      </Text>
    </BaseTemplate>
  )
}

