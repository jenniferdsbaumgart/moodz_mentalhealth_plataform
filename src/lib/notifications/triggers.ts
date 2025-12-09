import { db } from "@/lib/db"
import { createNotification, broadcastNotification } from "./service"

/**
 * Notifies therapist when a new session is created (for confirmation)
 * and potentially interested patients
 */
export async function notifySessionCreated(sessionId: string): Promise<void> {
  try {
    const session = await db.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!session) return

    const sessionDate = new Date(session.scheduledAt)
    const formattedDate = sessionDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    })

    // Notify therapist about session creation
    await createNotification({
      userId: session.therapist.userId,
      type: "SYSTEM_ANNOUNCEMENT",
      title: "✅ Sessão criada com sucesso",
      message: `Sua sessão "${session.title}" foi agendada para ${formattedDate}.`,
      data: {
        link: `/therapist/sessions/${sessionId}`,
        sessionId: sessionId
      }
    })
  } catch (error) {
    console.error("Failed to send session created notification:", error)
  }
}

/**
 * Notifies therapist when a patient enrolls in their session
 */
export async function notifySessionEnrollment(
  sessionId: string,
  patientId: string
): Promise<void> {
  try {
    const [session, patient] = await Promise.all([
      db.groupSession.findUnique({
        where: { id: sessionId },
        include: {
          therapist: {
            include: {
              user: { select: { id: true } }
            }
          },
          _count: { select: { participants: true } }
        }
      }),
      db.user.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          name: true
        }
      })
    ])

    if (!session || !patient) return

    const patientName = patient.name || "Um paciente"

    // Notify therapist about new enrollment
    await createNotification({
      userId: session.therapist.userId,
      type: "SYSTEM_ANNOUNCEMENT",
      title: "👤 Nova inscrição em sessão",
      message: `${patientName} se inscreveu na sessão "${session.title}". Total: ${session._count.participants + 1}/${session.maxParticipants} participantes.`,
      data: {
        link: `/therapist/sessions/${sessionId}`,
        sessionId: sessionId,
        patientId: patientId,
        currentParticipants: session._count.participants + 1
      }
    })

    // Notify patient about successful enrollment
    await createNotification({
      userId: patientId,
      type: "SESSION_REMINDER",
      title: "✅ Inscrição confirmada",
      message: `Você está inscrito na sessão "${session.title}". Não esqueça de participar!`,
      data: {
        link: `/sessions/${sessionId}`,
        sessionId: sessionId
      }
    })
  } catch (error) {
    console.error("Failed to send session enrollment notification:", error)
  }
}

/**
 * Notifies user about upcoming session (reminder)
 */
export async function notifySessionReminder(sessionId: string): Promise<void> {
  try {
    // Get session details
    const session = await db.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!session) return

    const sessionDate = new Date(session.scheduledAt)
    const now = new Date()
    const timeDiff = sessionDate.getTime() - now.getTime()
    const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))

    // Notify all participants
    const notifications = session.participants.map(participant => ({
      userId: participant.userId,
      type: "SESSION_REMINDER" as const,
      title: "Lembrete de Sessão",
      message: `Sua sessão "${session.title}" com ${session.therapist.user.name || 'Terapeuta'} começa em ${hoursUntil} hora${hoursUntil !== 1 ? 's' : ''}.`,
      data: {
        link: `/sessions/${sessionId}`,
        sessionId: sessionId,
        therapistName: session.therapist.user.name
      }
    }))

    await Promise.all(notifications.map(notification => createNotification(notification)))
  } catch (error) {
    console.error("Failed to send session reminder:", error)
  }
}

/**
 * Notifies users when session is about to start (5 minutes before)
 */
export async function notifySessionStarting(sessionId: string): Promise<void> {
  try {
    const session = await db.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!session) return

    const therapistName = session.therapist.user.name || 'Terapeuta'

    // Notify participants
    await broadcastNotification(
      session.participants.map(p => p.userId),
      {
        type: "SESSION_STARTING",
        title: "Sessão Começando Agora",
        message: `Sua sessão "${session.title}" com ${therapistName} está prestes a começar.`,
        data: {
          link: `/sessions/${sessionId}/room`,
          sessionId: sessionId,
          urgent: true
        }
      }
    )

    // Notify therapist
    await createNotification({
      userId: session.therapistId,
      type: "SESSION_STARTING",
      title: "Sessão Começando Agora",
      message: `Sua sessão "${session.title}" está prestes a começar.`,
      data: {
        link: `/sessions/${sessionId}/room`,
        sessionId: sessionId,
        urgent: true
      }
    })
  } catch (error) {
    console.error("Failed to send session starting notification:", error)
  }
}

/**
 * Notifies when session is cancelled
 */
export async function notifySessionCancelled(sessionId: string, reason?: string): Promise<void> {
  try {
    const session = await db.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!session) return

    const message = reason
      ? `Sua sessão "${session.title}" foi cancelada. Motivo: ${reason}`
      : `Sua sessão "${session.title}" foi cancelada.`

    // Notify participants
    await broadcastNotification(
      session.participants.map(p => p.userId),
      {
        type: "SESSION_CANCELLED",
        title: "Sessão Cancelada",
        message: message,
        data: {
          link: "/sessions",
          sessionId: sessionId,
          reason: reason
        }
      }
    )
  } catch (error) {
    console.error("Failed to send session cancelled notification:", error)
  }
}

/**
 * Notifies user when they earn a new badge
 */
export async function notifyNewBadge(userId: string, badgeId: string): Promise<void> {
  try {
    const badge = await db.badge.findUnique({
      where: { id: badgeId }
    })

    if (!badge) return

    await createNotification({
      userId: userId,
      type: "NEW_BADGE",
      title: "🏆 Novo Badge Conquistado!",
      message: `Parabéns! Você conquistou o badge "${badge.name}". ${badge.description}`,
      data: {
        link: "/gamification/badges",
        badgeId: badgeId
      }
    })
  } catch (error) {
    console.error("Failed to send new badge notification:", error)
  }
}

/**
 * Notifies user when their streak is at risk
 */
export async function notifyStreakRisk(userId: string): Promise<void> {
  try {
    // Get user's current streak
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        dailyCheckIns: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    })

    if (!user) return

    await createNotification({
      userId: userId,
      type: "STREAK_RISK",
      title: "🔥 Sua sequência está em risco!",
      message: "Você não fez check-in hoje. Mantenha sua sequência ativa!",
      data: {
        link: "/wellness/daily-checkin",
        urgent: true
      }
    })
  } catch (error) {
    console.error("Failed to send streak risk notification:", error)
  }
}

/**
 * Notifies user when their streak is achieved/maintained
 */
export async function notifyStreakAchieved(userId: string, streakCount: number): Promise<void> {
  try {
    await createNotification({
      userId: userId,
      type: "STREAK_ACHIEVED",
      title: "🔥 Sequência Mantida!",
      message: `Parabéns! Você manteve sua sequência de ${streakCount} dia${streakCount !== 1 ? 's' : ''} consecutivos.`,
      data: {
        link: "/gamification/streak",
        streakCount: streakCount
      }
    })
  } catch (error) {
    console.error("Failed to send streak achieved notification:", error)
  }
}

/**
 * Notifies post author when someone replies to their post
 */
export async function notifyNewReply(postId: string, commentId: string): Promise<void> {
  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: { id: true, name: true }
        },
        post: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!comment || !comment.post.author.id) return

    // Don't notify if user is replying to their own post
    if (comment.author.id === comment.post.author.id) return

    await createNotification({
      userId: comment.post.author.id,
      type: "NEW_POST_REPLY",
      title: "💬 Nova resposta no seu post",
      message: `${comment.author.name || 'Alguém'} respondeu ao seu post.`,
      data: {
        link: `/community/posts/${postId}#comment-${commentId}`,
        postId: postId,
        commentId: commentId,
        replierName: comment.author.name
      }
    })
  } catch (error) {
    console.error("Failed to send new reply notification:", error)
  }
}

/**
 * Notifies post author when their post receives an upvote
 */
export async function notifyPostUpvoted(postId: string, voterId: string): Promise<void> {
  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })

    if (!post || !post.author.id) return

    // Don't notify if user upvotes their own post
    if (voterId === post.author.id) return

    await createNotification({
      userId: post.author.id,
      type: "POST_UPVOTED",
      title: "👍 Seu post foi curtido",
      message: "Alguém curtiu seu post na comunidade.",
      data: {
        link: `/community/posts/${postId}`,
        postId: postId
      }
    })
  } catch (error) {
    console.error("Failed to send post upvoted notification:", error)
  }
}

/**
 * Notifies therapist when they are approved
 */
export async function notifyTherapistApproved(therapistId: string): Promise<void> {
  try {
    await createNotification({
      userId: therapistId,
      type: "THERAPIST_APPROVED",
      title: "🎉 Perfil Aprovado!",
      message: "Parabéns! Seu perfil de terapeuta foi aprovado. Você já pode começar a atender pacientes.",
      data: {
        link: "/therapist/dashboard"
      }
    })
  } catch (error) {
    console.error("Failed to send therapist approved notification:", error)
  }
}

/**
 * Notifies therapist when they receive a new review
 */
export async function notifyNewReview(therapistId: string, reviewId?: string): Promise<void> {
  try {
    await createNotification({
      userId: therapistId,
      type: "NEW_REVIEW",
      title: "⭐ Nova avaliação recebida",
      message: "Você recebeu uma nova avaliação de um paciente.",
      data: {
        link: "/therapist/reviews",
        reviewId: reviewId
      }
    })
  } catch (error) {
    console.error("Failed to send new review notification:", error)
  }
}

/**
 * Notifies all users about system announcements
 */
export async function notifySystemAnnouncement(
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // Get all users
    const users = await db.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true }
    })

    await broadcastNotification(
      users.map(u => u.id),
      {
        type: "SYSTEM_ANNOUNCEMENT",
        title: title,
        message: message,
        data: data
      }
    )
  } catch (error) {
    console.error("Failed to send system announcement:", error)
  }
}

/**
 * Notifies user about their weekly summary
 */
export async function notifyWeeklySummary(userId: string, summaryData: any): Promise<void> {
  try {
    const message = `Esta semana você teve ${summaryData.sessionsAttended || 0} sessões, ${summaryData.exercisesCompleted || 0} exercícios completados e ${summaryData.badgesEarned || 0} badges conquistados.`

    await createNotification({
      userId: userId,
      type: "WEEKLY_SUMMARY",
      title: "📊 Seu resumo semanal",
      message: message,
      data: {
        link: "/dashboard",
        summary: summaryData
      }
    })
  } catch (error) {
    console.error("Failed to send weekly summary notification:", error)
  }
}

// ============================================
// THERAPIST-SPECIFIC NOTIFICATIONS
// ============================================

/**
 * Notifies therapist about a new enrollment in their session
 * (More detailed version with participant count)
 */
export async function notifyNewEnrollment(
  sessionId: string,
  patientId: string
): Promise<void> {
  try {
    const [session, patient] = await Promise.all([
      db.groupSession.findUnique({
        where: { id: sessionId },
        include: {
          therapist: {
            include: {
              user: { select: { id: true } }
            }
          },
          _count: { select: { participants: true } }
        }
      }),
      db.user.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          name: true
        }
      })
    ])

    if (!session || !patient) return

    const patientName = patient.name || "Um paciente"
    const currentCount = session._count.participants
    const spotsLeft = session.maxParticipants - currentCount

    await createNotification({
      userId: session.therapist.userId,
      type: "NEW_ENROLLMENT",
      title: "👤 Nova inscrição em sessão",
      message: `${patientName} se inscreveu na sessão "${session.title}". ${spotsLeft > 0 ? `${spotsLeft} vaga${spotsLeft !== 1 ? 's' : ''} restante${spotsLeft !== 1 ? 's' : ''}.` : 'Sessão lotada!'}`,
      data: {
        link: `/therapist/sessions/${sessionId}`,
        sessionId: sessionId,
        patientId: patientId,
        patientName: patientName,
        currentParticipants: currentCount,
        maxParticipants: session.maxParticipants,
        spotsLeft: spotsLeft
      }
    })
  } catch (error) {
    console.error("Failed to send new enrollment notification:", error)
  }
}

/**
 * Notifies therapist about upcoming session (1 hour before)
 */
export async function notifySessionReminderTherapist(sessionId: string): Promise<void> {
  try {
    const session = await db.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        therapist: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        _count: { select: { participants: true } }
      }
    })

    if (!session) return

    const sessionDate = new Date(session.scheduledAt)
    const formattedTime = sessionDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })

    await createNotification({
      userId: session.therapist.userId,
      type: "SESSION_REMINDER_THERAPIST",
      title: "⏰ Lembrete: Sessão em 1 hora",
      message: `Sua sessão "${session.title}" começa às ${formattedTime}. ${session._count.participants} participante${session._count.participants !== 1 ? 's' : ''} inscrito${session._count.participants !== 1 ? 's' : ''}.`,
      data: {
        link: `/therapist/sessions/${sessionId}`,
        sessionId: sessionId,
        participantCount: session._count.participants,
        scheduledAt: session.scheduledAt.toISOString()
      }
    })
  } catch (error) {
    console.error("Failed to send therapist session reminder:", error)
  }
}

/**
 * Notifies therapist when a patient reaches a milestone
 */
export async function notifyPatientMilestone(
  therapistUserId: string,
  patientId: string,
  milestoneType: "sessions" | "streak" | "badges" | "exercises",
  milestoneValue: number
): Promise<void> {
  try {
    const patient = await db.user.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true
      }
    })

    if (!patient) return

    const patientName = patient.name || "Um paciente"

    const milestoneMessages: Record<string, { title: string; message: string }> = {
      sessions: {
        title: "🎯 Paciente atingiu marco de sessões",
        message: `${patientName} completou ${milestoneValue} sessões! Parabéns pelo progresso.`
      },
      streak: {
        title: "🔥 Paciente atingiu marco de sequência",
        message: `${patientName} manteve uma sequência de ${milestoneValue} dias consecutivos!`
      },
      badges: {
        title: "🏆 Paciente conquistou badges",
        message: `${patientName} conquistou ${milestoneValue} badges na plataforma!`
      },
      exercises: {
        title: "💪 Paciente completou exercícios",
        message: `${patientName} completou ${milestoneValue} exercícios de bem-estar!`
      }
    }

    const milestone = milestoneMessages[milestoneType]

    await createNotification({
      userId: therapistUserId,
      type: "PATIENT_MILESTONE",
      title: milestone.title,
      message: milestone.message,
      data: {
        link: `/therapist/patients/${patientId}`,
        patientId: patientId,
        patientName: patientName,
        milestoneType: milestoneType,
        milestoneValue: milestoneValue
      }
    })
  } catch (error) {
    console.error("Failed to send patient milestone notification:", error)
  }
}

/**
 * Notifies therapist when they receive a detailed review
 */
export async function notifyNewReviewDetailed(
  therapistUserId: string,
  reviewData: {
    rating: number
    sessionTitle: string
    patientName?: string
    isAnonymous: boolean
    comment?: string
  }
): Promise<void> {
  try {
    const stars = "⭐".repeat(reviewData.rating)
    const reviewer = reviewData.isAnonymous ? "Um paciente (anónimo)" : reviewData.patientName || "Um paciente"

    await createNotification({
      userId: therapistUserId,
      type: "NEW_REVIEW",
      title: `${stars} Nova avaliação recebida`,
      message: `${reviewer} avaliou a sessão "${reviewData.sessionTitle}" com ${reviewData.rating} estrela${reviewData.rating !== 1 ? 's' : ''}.${reviewData.comment ? ` Comentário: "${reviewData.comment.substring(0, 50)}${reviewData.comment.length > 50 ? '...' : ''}"` : ''}`,
      data: {
        link: "/therapist/reviews",
        rating: reviewData.rating,
        sessionTitle: reviewData.sessionTitle,
        hasComment: !!reviewData.comment
      }
    })
  } catch (error) {
    console.error("Failed to send detailed review notification:", error)
  }
}

