import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface AccountSuspendedEmailProps {
  userName: string
  suspensionType: "temporary" | "permanent"
  reason: string
  suspendedUntil?: string // Only for temporary suspensions
  violationType?: string
  appealUrl?: string
}

export function AccountSuspendedEmail({
  userName,
  suspensionType,
  reason,
  suspendedUntil,
  violationType,
  appealUrl = "https://moodz.com/support/appeal",
}: AccountSuspendedEmailProps) {
  const isTemporary = suspensionType === "temporary"

  return (
    <BaseTemplate preview={`Conta ${isTemporary ? "suspensa temporariamente" : "banida"}`}>
      <Heading style={{ ...h1, color: "#ef4444" }}>
        {isTemporary ? "⚠️ Conta Suspensa Temporariamente" : "🚫 Conta Banida"}
      </Heading>

      <Text style={text}>Olá {userName},</Text>

      <Text style={text}>
        {isTemporary
          ? "Sua conta foi temporariamente suspensa devido a uma violação das nossas diretrizes da comunidade."
          : "Lamentamos informar que sua conta foi permanentemente banida da plataforma Moodz."
        }
      </Text>

      <div style={{
        backgroundColor: "#fef2f2",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
        borderLeft: "4px solid #ef4444"
      }}>
        <Text style={{ ...text, margin: "0 0 12px 0", fontWeight: "bold" }}>
          Motivo da {isTemporary ? "suspensão" : "proibição"}:
        </Text>
        
        <Text style={{ ...text, margin: "0 0 12px 0" }}>
          {reason}
        </Text>

        {violationType && (
          <Text style={{ ...text, margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
            <strong>Tipo de violação:</strong> {violationType}
          </Text>
        )}

        {isTemporary && suspendedUntil && (
          <Text style={{ ...text, margin: "0", fontSize: "14px", color: "#666" }}>
            <strong>Suspensão válida até:</strong> {suspendedUntil}
          </Text>
        )}
      </div>

      {isTemporary ? (
        <>
          <Text style={text}>
            Durante o período de suspensão, você não poderá:
          </Text>
          <ul style={{ ...text, paddingLeft: "20px" }}>
            <li>Publicar na comunidade</li>
            <li>Comentar em posts</li>
            <li>Participar de sessões em grupo</li>
            <li>Enviar mensagens</li>
          </ul>
          <Text style={text}>
            Após o término da suspensão, sua conta será automaticamente reactivada. 
            Por favor, revise nossas{" "}
            <a href="https://moodz.com/guidelines" style={{ color: "#4F46E5" }}>
              diretrizes da comunidade
            </a>{" "}
            para evitar futuras violações.
          </Text>
        </>
      ) : (
        <Text style={text}>
          Esta decisão foi tomada após uma análise cuidadosa do seu histórico na plataforma. 
          Banimentos permanentes são aplicados apenas em casos de violações graves ou repetidas 
          das nossas diretrizes.
        </Text>
      )}

      <Text style={text}>
        Se você acredita que esta decisão foi tomada por engano, pode entrar com um recurso:
      </Text>

      <Button 
        style={{ 
          ...button, 
          backgroundColor: isTemporary ? "#4F46E5" : "#6b7280" 
        }} 
        href={appealUrl}
      >
        Solicitar Recurso
      </Button>

      <Text style={{ ...text, fontSize: "14px", color: "#666" }}>
        Nosso objetivo é manter a Moodz como um espaço seguro e acolhedor para todos. 
        Agradecemos sua compreensão.
      </Text>
    </BaseTemplate>
  )
}

