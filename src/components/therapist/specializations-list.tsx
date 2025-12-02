import { Badge } from "@/components/ui/badge"
import { Stethoscope } from "lucide-react"

interface SpecializationsListProps {
  specializations: string[]
  specialties: string[]
}

export function SpecializationsList({
  specializations,
  specialties,
}: SpecializationsListProps) {
  // Combinar especializações e especialidades, removendo duplicatas
  const allSpecializations = Array.from(
    new Set([...specializations, ...specialties])
  )

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-blue-600" />
        Especializações
      </h3>

      {allSpecializations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {allSpecializations.map((specialization, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-3 py-1 text-sm"
            >
              {specialization}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma especialização informada</p>
      )}
    </div>
  )
}

