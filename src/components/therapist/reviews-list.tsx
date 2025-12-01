import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MessageCircle, User } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment?: string | null
  isAnonymous: boolean
  createdAt: Date
  patientName?: string | null
  sessionTitle: string
}

interface ReviewsListProps {
  reviews: Review[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nenhuma avaliação ainda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Avaliações ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
            >
              <div className="flex items-start gap-4">
                {/* Avatar do paciente */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback>
                    {review.isAnonymous ? (
                      <User className="h-5 w-5" />
                    ) : (
                      review.patientName?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header da avaliação */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-gray-600">
                        {review.patientName && !review.isAnonymous
                          ? review.patientName
                          : "Avaliação anônima"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Sessão */}
                  <p className="text-sm text-blue-600 mb-2">
                    Sessão: {review.sessionTitle}
                  </p>

                  {/* Comentário */}
                  {review.comment && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
