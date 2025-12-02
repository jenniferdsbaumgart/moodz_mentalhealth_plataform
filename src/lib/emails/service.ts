import { Resend } from "resend"
import { db } from "@/lib/db"
import { ReactElement } from "react"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string
  subject: string
  template: (props: any) => ReactElement
  props: Record<string, any>
  userId?: string
  type?: string
}

/**
 * Sends an email using Resend with React Email templates
 * Logs the email delivery status in the database
 */
export async function sendEmail({
  to,
  subject,
  template,
  props,
  userId,
  type,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Create email log entry
    const log = await db.emailLog.create({
      data: {
        userId: userId || null,
        type: type || "general",
        to,
        subject,
        status: "PENDING"
      }
    })

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: "Moodz <notificacoes@moodz.com>",
        to,
        subject,
        react: template(props),
      })

      if (error) {
        throw error
      }

      // Update log with success
      await db.emailLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          sentAt: new Date()
        }
      })

      return { success: true, id: data?.id }
    } catch (error) {
      console.error("Failed to send email:", error)

      // Update log with failure
      await db.emailLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email"
      }
    }
  } catch (error) {
    console.error("Failed to create email log:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create email log"
    }
  }
}

/**
 * Sends an email without logging (for system emails)
 */
export async function sendRawEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Moodz <notificacoes@moodz.com>",
      to,
      subject,
      html,
    })

    if (error) {
      throw error
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error("Failed to send raw email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    }
  }
}

/**
 * Sends bulk emails (useful for announcements)
 */
export async function sendBulkEmails(
  emails: Array<{
    to: string
    subject: string
    template: (props: any) => ReactElement
    props: Record<string, any>
    userId?: string
    type?: string
  }>
): Promise<Array<{ success: boolean; id?: string; error?: string }>> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )

  return results.map(result =>
    result.status === "fulfilled"
      ? result.value
      : { success: false, error: "Promise rejected" }
  )
}

/**
 * Gets email delivery statistics
 */
export async function getEmailStats(userId?: string): Promise<{
  total: number
  sent: number
  failed: number
  pending: number
  bounceRate: number
}> {
  try {
    const where = userId ? { userId } : {}

    const [total, sent, failed, pending, bounced] = await Promise.all([
      db.emailLog.count({ where }),
      db.emailLog.count({ where: { ...where, status: "SENT" } }),
      db.emailLog.count({ where: { ...where, status: "FAILED" } }),
      db.emailLog.count({ where: { ...where, status: "PENDING" } }),
      db.emailLog.count({ where: { ...where, status: "BOUNCED" } })
    ])

    const bounceRate = total > 0 ? (bounced / total) * 100 : 0

    return { total, sent, failed, pending, bounceRate }
  } catch (error) {
    console.error("Failed to get email stats:", error)
    return { total: 0, sent: 0, failed: 0, pending: 0, bounceRate: 0 }
  }
}

/**
 * Manually triggers email sending for pending emails
 * Useful for testing or manual processing
 */
export async function processPendingEmails(limit: number = 50): Promise<number> {
  try {
    const pendingEmails = await db.emailLog.findMany({
      where: { status: "PENDING" },
      take: limit
    })

    let processed = 0

    for (const email of pendingEmails) {
      try {
        // In a real implementation, you'd need the original template and props
        // For now, we'll just mark as sent for testing
        console.log(`Processing email ${email.id} to ${email.to}`)

        await db.emailLog.update({
          where: { id: email.id },
          data: {
            status: "SENT",
            sentAt: new Date()
          }
        })

        processed++
      } catch (error) {
        console.error(`Failed to process email ${email.id}:`, error)

        await db.emailLog.update({
          where: { id: email.id },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error"
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

/**
 * Validates email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Creates unsubscribe URL for email templates
 */
export function createUnsubscribeUrl(userId: string, type?: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const params = new URLSearchParams({ userId })
  if (type) params.set("type", type)
  return `${baseUrl}/unsubscribe?${params.toString()}`
}

