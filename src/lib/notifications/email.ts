import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"
import { CreateNotificationInput } from "./service"
import { sendEmail } from "../emails/service"
import {
  SessionReminderEmail,
  SessionStartingEmail,
  WelcomeEmail,
  TherapistApprovedEmail,
  WeeklySummaryEmail,
  PasswordResetEmail,
  NewBadgeEmail
} from "../emails/templates"

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
    const emailTemplate = getEmailTemplate(type, notification, user.name || 'User', user.email)

    if (emailTemplate) {
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        template: emailTemplate.template,
        props: emailTemplate.props,
        userId: userId,
        type: type.toLowerCase()
      })
    }

  } catch (error) {
    console.error("Failed to queue email:", error)
    throw error
  }
}

/**
 * Gets the appropriate email template and props for a notification type
 */
function getEmailTemplate(
  type: NotificationType,
  notification: CreateNotificationInput,
  userName: string,
  userEmail: string
): { subject: string; template: any; props: any } | null {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://moodz.com'

  switch (type) {
    case 'SESSION_REMINDER':
      return {
        subject: 'Lembrete: Sua sessão começa em 1 hora',
        template: SessionReminderEmail,
        props: {
          userName,
          sessionTitle: notification.data?.sessionTitle || 'Sessão de Terapia',
          sessionDate: notification.data?.sessionDate || 'Hoje',
          sessionTime: notification.data?.sessionTime || 'Agora',
          therapistName: notification.data?.therapistName || 'Seu Terapeuta',
          joinUrl: `${baseUrl}/sessions/${notification.data?.sessionId || ''}/room`
        }
      }

    case 'SESSION_STARTING':
      return {
        subject: 'Sua sessão está começando agora',
        template: SessionStartingEmail,
        props: {
          userName,
          sessionTitle: notification.data?.sessionTitle || 'Sessão de Terapia',
          therapistName: notification.data?.therapistName || 'Seu Terapeuta',
          joinUrl: `${baseUrl}/sessions/${notification.data?.sessionId || ''}/room`
        }
      }

    case 'THERAPIST_APPROVED':
      return {
        subject: 'Parabéns! Seu perfil foi aprovado',
        template: TherapistApprovedEmail,
        props: {
          userName,
          dashboardUrl: `${baseUrl}/therapist/dashboard`,
          profileUrl: `${baseUrl}/therapist/profile`,
          patientsUrl: `${baseUrl}/therapist/patients`
        }
      }

    case 'WEEKLY_SUMMARY':
      return {
        subject: 'Seu resumo semanal - Moodz',
        template: WeeklySummaryEmail,
        props: {
          userName,
          userType: 'patient', // This should be determined from user role
          weekStart: notification.data?.weekStart || 'Semana passada',
          weekEnd: notification.data?.weekEnd || 'Esta semana',
          stats: {
            sessionsAttended: notification.data?.sessionsAttended || 0,
            exercisesCompleted: notification.data?.exercisesCompleted || 0,
            badgesEarned: notification.data?.badgesEarned || 0,
            moodEntries: notification.data?.moodEntries || 0
          }
        }
      }

    default:
      return null
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
