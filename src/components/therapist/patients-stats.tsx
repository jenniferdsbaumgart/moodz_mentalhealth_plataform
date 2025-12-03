"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, TrendingUp, UserCheck, TrendingDown, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatsData {
  stats: {
    uniquePatients: number
    patientsThisMonth: number
    patientsLastMonth: number
    sessionsThisMonth: number
    sessionsLastMonth: number
  }
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current > 0 ? (
      <span className="text-xs text-green-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Novo
      </span>
    ) : null
  }

  const percentChange = ((current - previous) / previous) * 100
  const isPositive = percentChange > 0
  const isNeutral = percentChange === 0

  if (isNeutral) {
    return (
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Minus className="h-3 w-3" />
        Estável
      </span>
    )
  }

  return (
    <span className={`text-xs flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{percentChange.toFixed(0)}%
    </span>
  )
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  trend,
  tooltip,
  isLoading,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: number | string
  trend?: { current: number; previous: number }
  tooltip: string
  isLoading: boolean
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-white rounded-lg p-6 shadow-sm border cursor-help transition-shadow hover:shadow-md">
            <div className="flex items-center">
              <Icon className={`h-8 w-8 ${iconColor}`} />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{value}</p>
                    {trend && <TrendIndicator current={trend.current} previous={trend.previous} />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PatientsStats() {
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["therapist", "analytics"],
    queryFn: async () => {
      const res = await fetch("/api/therapist/analytics?period=month")
      if (!res.ok) throw new Error("Failed to fetch analytics")
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const stats = data?.stats

  // Calcular pacientes ativos (baseado em patientsThisMonth como proxy)
  // Um paciente ativo é aquele que participou de sessões recentemente
  const activePatientsCount = stats?.patientsThisMonth || 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={Users}
        iconColor="text-blue-600"
        label="Total de Pacientes"
        value={stats?.uniquePatients ?? 0}
        tooltip="Número total de pacientes únicos que já participaram das suas sessões"
        isLoading={isLoading}
      />

      <StatCard
        icon={TrendingUp}
        iconColor="text-green-600"
        label="Sessões Este Mês"
        value={stats?.sessionsThisMonth ?? 0}
        trend={stats ? {
          current: stats.sessionsThisMonth,
          previous: stats.sessionsLastMonth
        } : undefined}
        tooltip="Quantidade de sessões realizadas no mês atual"
        isLoading={isLoading}
      />

      <StatCard
        icon={UserCheck}
        iconColor="text-purple-600"
        label="Pacientes Ativos"
        value={activePatientsCount}
        trend={stats ? {
          current: stats.patientsThisMonth,
          previous: stats.patientsLastMonth
        } : undefined}
        tooltip="Pacientes que participaram de sessões este mês"
        isLoading={isLoading}
      />
    </div>
  )
}

