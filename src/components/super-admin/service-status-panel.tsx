"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Database,
  Radio,
  Mail,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceStatus {
  name: string
  status: "online" | "offline" | "degraded"
  latency?: number
  lastChecked: string
  details?: string
}

interface SystemStatusResponse {
  services: ServiceStatus[]
  database: {
    connected: boolean
    latency: number
  }
  uptime: number
  memory: {
    used: number
    total: number
  }
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  database: Database,
  pusher: Radio,
  resend: Mail,
  daily: Video,
}

export function ServiceStatusPanel() {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<SystemStatusResponse>({
    queryKey: ["system-status"],
    queryFn: async () => {
      const res = await fetch("/api/super-admin/system/status")
      if (!res.ok) throw new Error("Failed to fetch status")
      return res.json()
    },
    refetchInterval: 60000, // Refresh every minute
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500 bg-green-500/10"
      case "offline":
        return "text-red-500 bg-red-500/10"
      case "degraded":
        return "text-yellow-500 bg-yellow-500/10"
      default:
        return "text-gray-500 bg-gray-500/10"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return CheckCircle
      case "offline":
        return XCircle
      case "degraded":
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(0)} MB`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status dos Serviços
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real das integrações
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Stats */}
        {data && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Uptime
              </div>
              <p className="text-lg font-semibold mt-1">
                {formatUptime(data.uptime)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Memória
              </div>
              <p className="text-lg font-semibold mt-1">
                {formatMemory(data.memory.used)} / {formatMemory(data.memory.total)}
              </p>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="space-y-3">
          {data?.services.map((service) => {
            const Icon = SERVICE_ICONS[service.name.toLowerCase()] || Database
            const StatusIcon = getStatusIcon(service.status)

            return (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-full p-2", getStatusColor(service.status))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.details && (
                      <p className="text-xs text-muted-foreground">
                        {service.details}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {service.latency !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {service.latency}ms
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("gap-1", getStatusColor(service.status))}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {service.status === "online"
                      ? "Online"
                      : service.status === "offline"
                      ? "Offline"
                      : "Degradado"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Last checked */}
        {data?.services[0] && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Última verificação:{" "}
            {new Date(data.services[0].lastChecked).toLocaleString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
