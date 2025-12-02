import { Body, Container, Head, Html, Preview } from "@react-email/components"
import { footer, main } from "./styles"

interface BaseTemplateProps {
  children: React.ReactNode
  preview?: string
}

export function BaseTemplate({ children, preview }: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={{ margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" }}>
          {children}

          {/* Footer */}
          <div style={footer}>
            <p>
              Você está recebendo este email porque está cadastrado na Moodz.
              <br />
              Se não quiser mais receber notificações, você pode{" "}
              <a
                href="{{unsubscribe_url}}"
                style={{ color: "#4F46E5", textDecoration: "underline" }}
              >
                cancelar a inscrição
              </a>{" "}
              nas suas preferências.
            </p>
            <p>
              Moodz - Saúde Mental para Todos
              <br />
              <a href="https://moodz.com" style={{ color: "#4F46E5", textDecoration: "underline" }}>
                moodz.com
              </a>
            </p>
          </div>
        </Container>
      </Body>
    </Html>
  )
}

