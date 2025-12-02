import {
  Button,
  Heading,
  Text,
} from "@react-email/components"
import { BaseTemplate } from "../base-template"
import { button, h1, text } from "../styles"

interface NewReviewEmailProps {
  therapistName: string
  sessionTitle: string
  rating: number
  comment?: string
  isAnonymous: boolean
  patientName?: string
  reviewDate: string
}

function renderStars(rating: number) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? "★" : "☆")
  }
  return stars.join("")
}

export function NewReviewEmail({
  therapistName,
  sessionTitle,
  rating,
  comment,
  isAnonymous,
  patientName,
  reviewDate,
}: NewReviewEmailProps) {
  return (
    <BaseTemplate preview={`Nova avaliação recebida - ${rating} estrelas`}>
      <Heading style={h1}>⭐ Nova Avaliação Recebida</Heading>

      <Text style={text}>Olá {therapistName},</Text>

      <Text style={text}>
        Você recebeu uma nova avaliação de um paciente! Confira os detalhes abaixo:
      </Text>

      <div style={{
        backgroundColor: "#f8f8f8",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0"
      }}>
        <Text style={{ ...text, margin: "0 0 12px 0" }}>
          <strong>Sessão:</strong> {sessionTitle}
        </Text>
        
        <Text style={{ ...text, margin: "0 0 12px 0" }}>
          <strong>Paciente:</strong> {isAnonymous ? "Anónimo" : patientName || "Paciente"}
        </Text>
        
        <Text style={{ ...text, margin: "0 0 12px 0" }}>
          <strong>Data:</strong> {reviewDate}
        </Text>

        <Text style={{ 
          ...text, 
          margin: "0 0 12px 0",
          fontSize: "24px",
          color: "#f59e0b"
        }}>
          {renderStars(rating)} ({rating}/5)
        </Text>

        {comment && (
          <Text style={{ 
            ...text, 
            margin: "12px 0 0 0",
            fontStyle: "italic",
            borderLeft: "3px solid #4F46E5",
            paddingLeft: "12px"
          }}>
            "{comment}"
          </Text>
        )}
      </div>

      <Text style={text}>
        As avaliações dos pacientes são fundamentais para melhorar continuamente a qualidade 
        do atendimento. Obrigado por fazer a diferença na vida das pessoas!
      </Text>

      <Button style={button} href="https://moodz.com/therapist/reviews">
        Ver Todas as Avaliações
      </Button>
    </BaseTemplate>
  )
}

