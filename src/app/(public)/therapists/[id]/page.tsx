import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicTherapistProfile } from "@/types/user"
import { PublicProfileHeader } from "@/components/therapist/public-profile-header"
import { SpecializationsList } from "@/components/therapist/specializations-list"
import { StatsCard } from "@/components/therapist/stats-card"
import { ReviewsList } from "@/components/therapist/reviews-list"
import { UpcomingSessions } from "@/components/therapist/upcoming-sessions"
import { Button } from "@/components/ui/button"
import { CalendarDays, Star } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

async function getTherapist(id: string): Promise<PublicTherapistProfile | null> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/therapists/${id}`,
      {
        cache: 'no-store', // Sempre buscar dados frescos para perfis públicos
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Erro ao buscar terapeuta:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const therapist = await getTherapist(params.id)

  if (!therapist) {
    return {
      title: "Terapeuta não encontrado | Moodz",
    }
  }

  const profile = therapist.therapistProfile

  return {
    title: `${therapist.name} - Terapeuta | Moodz`,
    description: profile.publicBio?.slice(0, 160) || profile.bio?.slice(0, 160),
    openGraph: {
      title: therapist.name || "Terapeuta",
      description: profile.specializations?.join(", ") || profile.specialties.join(", "),
      images: profile.photoUrl ? [profile.photoUrl] : therapist.image ? [therapist.image] : [],
      type: "profile",
    },
  }
}

export default async function TherapistPublicPage({ params }: PageProps) {
  const therapist = await getTherapist(params.id)

  if (!therapist) {
    notFound()
  }

  const profile = therapist.therapistProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header do Perfil */}
          <PublicProfileHeader
            name={therapist.name}
            image={therapist.image}
            photoUrl={profile.photoUrl}
            crp={profile.crp}
            isVerified={profile.isVerified}
            bio={profile.publicBio || profile.bio}
          />

          {/* Especializações e Idiomas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpecializationsList
              specializations={profile.specializations || []}
              specialties={profile.specialties}
            />

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Idiomas
              </h3>
              {profile.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Não informado</p>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          {profile.stats && (
            <StatsCard
              totalSessions={profile.stats.totalSessions}
              totalPatients={profile.stats.totalPatients}
              avgRating={profile.stats.avgRating}
            />
          )}

          {/* Avaliações */}
          <ReviewsList reviews={profile.reviews} />

          {/* Sessões Próximas */}
          <UpcomingSessions sessions={profile.upcomingSessions} />

          {/* Botão de ação */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <Link href="/sessions">
              <Button size="lg" className="w-full md:w-auto">
                <CalendarDays className="h-5 w-5 mr-2" />
                Ver Todas as Sessões
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

