import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"
import { CreateNotificationInput } from "./service"

/**
 * Queues an email notification for sending
 */
export async function queueEmail(
  userId: string,
  type: NotificationType,
  notification: CreateNotificationInput
): Promise<void> {
  try {
    // Get user email
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user?.email) {
      console.warn(`No email found for user ${userId}`)
      return
    }

    // Generate email content based on type
    const emailContent = generateEmailContent(type, notification, user.name || 'User')

    // Create email log entry
    await db.emailLog.create({
      data: {
        userId: userId,
        type: type.toLowerCase(),
        to: user.email,
        subject: emailContent.subject,
        status: 'PENDING'
      }
    })

    // In a real implementation, you would queue this for sending
    // For now, we'll simulate sending by updating the status
    // In production, you'd use a service like SendGrid, SES, etc.

    console.log(`Email queued for ${user.email}: ${emailContent.subject}`)

    // Simulate sending (in production, this would be handled by a queue worker)
    setTimeout(async () => {
      try {
        await db.emailLog.updateMany({
          where: {
            userId: userId,
            type: type.toLowerCase(),
            status: 'PENDING'
          },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        })
      } catch (error) {
        console.error("Failed to update email status:", error)
      }
    }, 1000)

  } catch (error) {
    console.error("Failed to queue email:", error)
    throw error
  }
}

/**
 * Generates email content based on notification type
 */
function generateEmailContent(
  type: NotificationType,
  notification: CreateNotificationInput,
  userName: string
): { subject: string; content: string } {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://moodz.com'

  switch (type) {
    case 'SESSION_REMINDER':
      return {
        subject: 'Lembrete: Sua sessão começa em breve',
        content: `
          <h2>Olá ${userName}!</h2>
          <p>Este é um lembrete de que sua sessão de terapia está programada para começar em breve.</p>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/sessions/${notification.data?.sessionId || ''}">Acessar sessão</a></p>
        `
      }

    case 'SESSION_CANCELLED':
      return {
        subject: 'Sessão Cancelada',
        content: `
          <h2>Olá ${userName}!</h2>
          <p>Infelizmente, uma sessão foi cancelada.</p>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/sessions">Ver minhas sessões</a></p>
        `
      }

    case 'THERAPIST_APPROVED':
      return {
        subject: 'Parabéns! Você foi aprovado como terapeuta',
        content: `
          <h2>Parabéns ${userName}!</h2>
          <p>Seu perfil de terapeuta foi aprovado e você agora pode começar a atender pacientes.</p>
          <p><a href="${baseUrl}/therapist/dashboard">Acessar painel do terapeuta</a></p>
        `
      }

    case 'NEW_REVIEW':
      return {
        subject: 'Nova avaliação recebida',
        content: `
          <h2>Olá ${userName}!</h2>
          <p>Você recebeu uma nova avaliação de um paciente.</p>
          <p><strong>${notification.title}</strong></p>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/therapist/reviews">Ver avaliações</a></p>
        `
      }

    case 'SYSTEM_ANNOUNCEMENT':
      return {
        subject: 'Anúncio Importante do Sistema',
        content: `
          <h2>Olá ${userName}!</h2>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/notifications">Ver detalhes</a></p>
        `
      }

    case 'WEEKLY_SUMMARY':
      return {
        subject: 'Seu resumo semanal - Moodz',
        content: `
          <h2>Olá ${userName}!</h2>
          <p>Aqui está seu resumo semanal de atividades no Moodz:</p>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/dashboard">Ver dashboard completo</a></p>
        `
      }

    default:
      return {
        subject: notification.title,
        content: `
          <h2>Olá ${userName}!</h2>
          <p>${notification.message}</p>
          <p><a href="${baseUrl}/notifications">Ver notificações</a></p>
        `
      }
  }
}

/**
 * Gets email delivery statistics
 */
export async function getEmailStats(userId?: string): Promise<{
  total: number
  sent: number
  failed: number
  pending: number
}> {
  try {
    const where = userId ? { userId } : {}

    const [total, sent, failed, pending] = await Promise.all([
      db.emailLog.count({ where }),
      db.emailLog.count({ where: { ...where, status: 'SENT' } }),
      db.emailLog.count({ where: { ...where, status: 'FAILED' } }),
      db.emailLog.count({ where: { ...where, status: 'PENDING' } })
    ])

    return { total, sent, failed, pending }
  } catch (error) {
    console.error("Failed to get email stats:", error)
    return { total: 0, sent: 0, failed: 0, pending: 0 }
  }
}

/**
 * Manually triggers email sending for pending emails
 * Useful for testing or manual processing
 */
export async function processPendingEmails(): Promise<number> {
  try {
    const pendingEmails = await db.emailLog.findMany({
      where: { status: 'PENDING' }
    })

    let processed = 0

    for (const email of pendingEmails) {
      try {
        // In a real implementation, send the actual email here
        console.log(`Sending email to ${email.to}: ${email.subject}`)

        await db.emailLog.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        })

        processed++
      } catch (error) {
        console.error(`Failed to send email ${email.id}:`, error)

        await db.emailLog.update({
          where: { id: email.id },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    return processed
  } catch (error) {
    console.error("Failed to process pending emails:", error)
    return 0
  }
}
