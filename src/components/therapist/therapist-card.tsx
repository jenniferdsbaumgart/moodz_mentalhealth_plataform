"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Calendar, Shield, MapPin } from "lucide-react"
import Link from "next/link"

interface Therapist {
  id: string
  name: string
  image?: string
  bio?: string
  specializations?: string[]
  specialties: string[]
  languages?: string[]
  availableForNew: boolean
  isVerified: boolean
  hourlyRate?: number
  sessionPrice?: number
  currency?: string
  stats?: {
    totalSessions: number
    totalPatients: number
    avgRating?: number
  }
  _count?: {
    reviews: number
  }
}

interface TherapistCardProps {
  therapist: Therapist
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function TherapistCard({ therapist }: TherapistCardProps) {
  const displayRating = therapist.stats?.avgRating || 0
  const totalReviews = therapist._count?.reviews || 0
  const totalSessions = therapist.stats?.totalSessions || 0

  // Combinar especializações e especialidades
  const allSpecializations = Array.from(
    new Set([...(therapist.specializations || []), ...therapist.specialties])
  )

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage src={therapist.image} alt={therapist.name} />
            <AvatarFallback className="text-lg">
              {therapist.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {therapist.name}
              </h3>
              {therapist.isVerified && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-2">
              {displayRating > 0 ? (
                <>
                  <StarRating rating={Math.round(displayRating)} />
                  <span className="text-sm font-medium text-gray-900">
                    {displayRating.toFixed(1)}
                  </span>
                  {totalReviews > 0 && (
                    <span className="text-sm text-gray-600">
                      ({totalReviews} avaliação{totalReviews !== 1 ? 's' : ''})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-500">Sem avaliações</span>
              )}
            </div>

            {/* Availability Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                therapist.availableForNew ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className={`text-xs ${
                therapist.availableForNew ? 'text-green-700' : 'text-gray-600'
              }`}>
                {therapist.availableForNew ? 'Aceitando novos pacientes' : 'Lista de espera'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {therapist.bio && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {therapist.bio}
          </p>
        )}

        {/* Specializations */}
        {allSpecializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allSpecializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {allSpecializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{allSpecializations.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Languages */}
        {therapist.languages && therapist.languages.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>Idiomas:</span>
            <span>{therapist.languages.join(", ")}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalSessions} sessões</span>
          </div>

          {therapist.sessionPrice && (
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">
                R$ {therapist.sessionPrice}
              </span>
              <span className="text-xs">/sessão</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/therapists/${therapist.id}`}>
          <Button className="w-full group-hover:bg-primary/90 transition-colors">
            Ver Perfil Completo
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

