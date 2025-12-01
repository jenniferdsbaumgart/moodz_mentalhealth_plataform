import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShieldCheck } from "lucide-react"

interface PublicProfileHeaderProps {
  name: string | null
  image: string | null
  photoUrl?: string | null
  crp: string
  isVerified: boolean
  bio: string
}

export function PublicProfileHeader({
  name,
  image,
  photoUrl,
  crp,
  isVerified,
  bio,
}: PublicProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar/Foto */}
        <div className="flex-shrink-0">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={photoUrl || image || ""}
              alt={name || "Terapeuta"}
            />
            <AvatarFallback className="text-2xl">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Informações */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {name || "Terapeuta"}
              </h1>
              {isVerified && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-lg text-gray-600">
              CRP: {crp}
            </p>
          </div>

          {/* Bio */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
