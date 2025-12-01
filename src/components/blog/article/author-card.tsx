import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from "@prisma/client"
import { Calendar, Clock, Eye } from "lucide-react"

interface AuthorCardProps {
  author: Pick<User, "id" | "name" | "email" | "image">
  publishedAt: Date
  readingTime: number | null
  viewCount: number
}

export function AuthorCard({ author, publishedAt, readingTime, viewCount }: AuthorCardProps) {
  const authorInitials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={author.image || ""}
              alt={`Foto de ${author.name}`}
            />
            <AvatarFallback className="text-lg">
              {authorInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{author.name}</h3>
              <Badge variant="secondary" className="text-xs">
                Autor
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {publishedAt.toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min de leitura</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{viewCount.toLocaleString()} visualizações</span>
              </div>
            </div>

            {/* TODO: Add author bio/description when available in user profile */}
            <p className="text-sm text-muted-foreground mt-3">
              Especialista em saúde mental e bem-estar emocional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

