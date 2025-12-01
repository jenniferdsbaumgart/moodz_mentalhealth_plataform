import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Star } from "lucide-react"

interface StatsCardProps {
  totalSessions: number
  totalPatients: number
  avgRating?: number | null
}

export function StatsCard({
  totalSessions,
  totalPatients,
  avgRating,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sessões Totais */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalSessions}
            </div>
            <div className="text-sm text-gray-600">
              Sessões realizadas
            </div>
          </div>

          {/* Pacientes Totais */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalPatients}
            </div>
            <div className="text-sm text-gray-600">
              Pacientes atendidos
            </div>
          </div>

          {/* Avaliação Média */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {avgRating ? avgRating.toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              Avaliação média
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
