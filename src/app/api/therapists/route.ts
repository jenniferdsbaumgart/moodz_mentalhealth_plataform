// Mock data para terapeutas
const mockTherapists = [
  {
    id: "therapist-1",
    name: "Dra. Ana Silva",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: "Psicóloga clínica com 12 anos de experiência em terapia cognitivo-comportamental.",
    specializations: ["Psicologia Clínica", "TCC"],
    specialties: ["Ansiedade", "Depressão"],
    languages: ["Português", "Inglês"],
    availableForNew: true,
    isVerified: true,
    sessionPrice: 150,
    currency: "BRL",
    stats: {
      totalSessions: 1247,
      totalPatients: 89,
      avgRating: 4.8
    },
    _count: {
      reviews: 23
    }
  }
]

// Mock data para terapeutas (em produção seria do banco)
const mockTherapists = [
  {
    id: "therapist-1",
    name: "Dra. Ana Silva",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: "Psicóloga clínica com 12 anos de experiência em terapia cognitivo-comportamental. Especializada em ansiedade, depressão e transtornos de humor.",
    specializations: ["Psicologia Clínica", "Terapia Cognitivo-Comportamental (TCC)"],
    specialties: ["Ansiedade", "Depressão", "Transtornos de Humor"],
    languages: ["Português", "Inglês"],
    availableForNew: true,
    isVerified: true,
    sessionPrice: 150,
    currency: "BRL",
    stats: {
      totalSessions: 1247,
      totalPatients: 89,
      avgRating: 4.8
    },
    _count: {
      reviews: 23
    }
  },
  {
    id: "therapist-2",
    name: "Dr. Carlos Santos",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    bio: "Psicanalista junguiano com formação em psicologia analítica. Trabalho com questões existenciais, desenvolvimento pessoal e relacionamentos.",
    specializations: ["Psicanálise", "Psicologia Analítica"],
    specialties: ["Desenvolvimento Pessoal", "Relacionamentos", "Crises Existenciais"],
    languages: ["Português", "Espanhol"],
    availableForNew: false,
    isVerified: true,
    sessionPrice: 180,
    currency: "BRL",
    stats: {
      totalSessions: 892,
      totalPatients: 67,
      avgRating: 4.6
    },
    _count: {
      reviews: 18
    }
  },
  {
    id: "therapist-3",
    name: "Dra. Maria Oliveira",
    image: "https://images.unsplash.com/photo-1594824804732-ca8db723f8fa?w=150&h=150&fit=crop&crop=face",
    bio: "Especialista em terapia familiar e de casais. Ajudo famílias a resolver conflitos e fortalecer vínculos emocionais.",
    specializations: ["Terapia Familiar e de Casais", "Psicologia Sistêmica"],
    specialties: ["Terapia de Casais", "Conflitos Familiares", "Divórcio"],
    languages: ["Português"],
    availableForNew: true,
    isVerified: true,
    sessionPrice: 160,
    currency: "BRL",
    stats: {
      totalSessions: 756,
      totalPatients: 45,
      avgRating: 4.9
    },
    _count: {
      reviews: 31
    }
  },
  {
    id: "therapist-4",
    name: "Dr. Roberto Lima",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Psicólogo infantil e adolescente. Especializado em TDAH, TEA e dificuldades escolares. Abordagem lúdica e acolhedora.",
    specializations: ["Psicologia Infantil e Adolescente", "Neuropsicologia"],
    specialties: ["TDAH", "TEA", "Dificuldades de Aprendizagem"],
    languages: ["Português", "Inglês", "Francês"],
    availableForNew: true,
    isVerified: true,
    sessionPrice: 140,
    currency: "BRL",
    stats: {
      totalSessions: 634,
      totalPatients: 52,
      avgRating: 4.7
    },
    _count: {
      reviews: 15
    }
  },
  {
    id: "therapist-5",
    name: "Dra. Sofia Costa",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    bio: "Terapeuta gestalt com foco em desenvolvimento pessoal e criatividade. Trabalho com arte-terapia e expressão emocional.",
    specializations: ["Terapia Gestalt", "Arteterapia"],
    specialties: ["Desenvolvimento Pessoal", "Criatividade", "Expressão Emocional"],
    languages: ["Português", "Italiano"],
    availableForNew: true,
    isVerified: true,
    sessionPrice: 155,
    currency: "BRL",
    stats: {
      totalSessions: 423,
      totalPatients: 34,
      avgRating: 4.5
    },
    _count: {
      reviews: 12
    }
  },
  {
    id: "therapist-6",
    name: "Dr. Pedro Almeida",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    bio: "Psicólogo esportivo e organizacional. Ajudo atletas e profissionais a otimizar performance e lidar com pressão.",
    specializations: ["Psicologia Esportiva", "Psicologia Organizacional"],
    specialties: ["Performance", "Gestão do Stress", "Liderança"],
    languages: ["Português", "Inglês"],
    availableForNew: false,
    isVerified: true,
    sessionPrice: 170,
    currency: "BRL",
    stats: {
      totalSessions: 589,
      totalPatients: 41,
      avgRating: 4.4
    },
    _count: {
      reviews: 9
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") || ""
    const specialization = searchParams.get("specialization") || "all"
    const language = searchParams.get("language") || "all"
    const available = searchParams.get("available") === "true"
    const sort = searchParams.get("sort") || "rating"

    let filteredTherapists = mockTherapists.filter(therapist => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = therapist.name.toLowerCase().includes(searchLower)
        const bioMatch = therapist.bio.toLowerCase().includes(searchLower)
        const specializationMatch = therapist.specializations.some(spec =>
          spec.toLowerCase().includes(searchLower)
        )
        const specialtyMatch = therapist.specialties.some(spec =>
          spec.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !bioMatch && !specializationMatch && !specialtyMatch) {
          return false
        }
      }

      // Specialization filter
      if (specialization !== "all") {
        if (!therapist.specializations.includes(specialization) &&
            !therapist.specialties.includes(specialization)) {
          return false
        }
      }

      // Language filter
      if (language !== "all") {
        if (!therapist.languages.includes(language)) {
          return false
        }
      }

      // Available filter
      if (available && !therapist.availableForNew) {
        return false
      }

      return true
    })

    // Sort therapists
    filteredTherapists = filteredTherapists.sort((a, b) => {
      switch (sort) {
        case "rating":
          return (b.stats.avgRating || 0) - (a.stats.avgRating || 0)
        case "sessions":
          return b.stats.totalSessions - a.stats.totalSessions
        case "recent":
          // For mock data, we'll sort by total sessions as proxy for "recent"
          return b.stats.totalSessions - a.stats.totalSessions
        default:
          return 0
      }
    })

    // Calculate stats
    const stats = {
      total: mockTherapists.length,
      verified: mockTherapists.filter(t => t.isVerified).length,
      available: mockTherapists.filter(t => t.availableForNew).length,
      avgRating: mockTherapists.reduce((sum, t) => sum + (t.stats.avgRating || 0), 0) / mockTherapists.length
    }

    return NextResponse.json({
      success: true,
      data: filteredTherapists,
      stats,
      filters: {
        search,
        specialization,
        language,
        available,
        sort
      }
    })
  } catch (error) {
    console.error("Erro ao buscar terapeutas:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
