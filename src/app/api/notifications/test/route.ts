import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"

// Test notification content for each type
const testNotifications: Record<string, { title: string; message: string; data?: Record<string, any> }> = {
  // Patient session notifications
  SESSION_REMINDER: {
    title: "Lembrete: Sessão em 1 hora",
    message: "Sua sessão de terapia com Dr. Silva começa em 1 hora. Prepare-se!",
    data: { sessionId: "test-session", link: "/sessions" }
  },
  SESSION_STARTING: {
    title: "Sua sessão está começando!",
    message: "A sessão de terapia está prestes a começar. Clique para entrar.",
    data: { sessionId: "test-session", link: "/sessions" }
  },
  SESSION_CANCELLED: {
    title: "Sessão cancelada",
    message: "Infelizmente, sua sessão de hoje foi cancelada. Entre em contato para reagendar.",
    data: { sessionId: "test-session", link: "/sessions" }
  },
  
  // Therapist session notifications
  SESSION_REMINDER_THERAPIST: {
    title: "⏰ Lembrete: Sessão em 1 hora",
    message: "Sua sessão 'Mindfulness para Iniciantes' começa às 14:00. 8 participantes inscritos.",
    data: { sessionId: "test-session", link: "/therapist/sessions", participantCount: 8 }
  },
  NEW_ENROLLMENT: {
    title: "👤 Nova inscrição em sessão",
    message: "Maria Silva se inscreveu na sessão 'Mindfulness para Iniciantes'. 2 vagas restantes.",
    data: { sessionId: "test-session", link: "/therapist/sessions", patientName: "Maria Silva", spotsLeft: 2 }
  },
  
  // Communication
  NEW_MESSAGE: {
    title: "Nova mensagem",
    message: "Você recebeu uma nova mensagem de Dr. Silva.",
    data: { link: "/messages" }
  },
  
  // Gamification
  NEW_BADGE: {
    title: "🏆 Novo badge conquistado!",
    message: "Parabéns! Você conquistou o badge 'Primeira Sessão'. Continue assim!",
    data: { badgeId: "test-badge", link: "/profile/badges" }
  },
  STREAK_RISK: {
    title: "🔥 Seu streak está em risco!",
    message: "Não perca seu streak de 7 dias! Complete uma atividade hoje.",
    data: { link: "/dashboard" }
  },
  STREAK_ACHIEVED: {
    title: "🎉 Streak mantido!",
    message: "Incrível! Você manteve seu streak por mais um dia. Continue assim!",
    data: { streakDays: 7, link: "/dashboard" }
  },
  
  // Community
  NEW_POST_REPLY: {
    title: "Nova resposta no seu post",
    message: "Alguém respondeu ao seu post na comunidade. Confira!",
    data: { postId: "test-post", link: "/community" }
  },
  POST_UPVOTED: {
    title: "Seu post recebeu um upvote!",
    message: "Alguém gostou do seu post na comunidade.",
    data: { postId: "test-post", link: "/community" }
  },
  
  // Therapist specific
  THERAPIST_APPROVED: {
    title: "✅ Perfil aprovado!",
    message: "Parabéns! Seu perfil de terapeuta foi aprovado. Você já pode atender pacientes.",
    data: { link: "/therapist/dashboard" }
  },
  NEW_REVIEW: {
    title: "⭐⭐⭐⭐⭐ Nova avaliação recebida",
    message: "Maria Silva avaliou a sessão 'Mindfulness para Iniciantes' com 5 estrelas. Comentário: 'Excelente sessão!'",
    data: { rating: 5, link: "/therapist/reviews", hasComment: true }
  },
  PATIENT_MILESTONE: {
    title: "🎯 Paciente atingiu marco de sessões",
    message: "João Santos completou 10 sessões! Parabéns pelo progresso do seu paciente.",
    data: { patientId: "test-patient", link: "/therapist/patients", milestoneType: "sessions", milestoneValue: 10 }
  },
  
  // System
  SYSTEM_ANNOUNCEMENT: {
    title: "📢 Novidades na Moodz",
    message: "Confira as novas funcionalidades que adicionamos à plataforma!",
    data: { link: "/announcements" }
  },
  WEEKLY_SUMMARY: {
    title: "📊 Seu resumo semanal",
    message: "Veja como foi sua semana: 3 sessões, 2 badges e muito mais!",
    data: { link: "/dashboard" }
  }
}

/**
 * POST /api/notifications/test
 * Send a test notification of a specific type
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type } = body

    if (!type || !Object.values(NotificationType).includes(type as NotificationType)) {
      return NextResponse.json(
        { error: "Invalid notification type" },
        { status: 400 }
      )
    }

    const testContent = testNotifications[type]

    if (!testContent) {
      return NextResponse.json(
        { error: "Test content not available for this type" },
        { status: 400 }
      )
    }

    // Create the test notification
    const result = await createNotification({
      userId: session.user.id,
      type: type as NotificationType,
      title: `[TESTE] ${testContent.title}`,
      message: testContent.message,
      data: testContent.data
    })

    return NextResponse.json({
      success: true,
      channels: result
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    )
  }
}

