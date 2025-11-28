import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface SystemStatusProps {
  stats: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    totalPosts: number
    pendingReports: number
    pendingTherapists: number
  }
}

export function SystemStatus({ stats }: SystemStatusProps) {
  // Simular status de serviços externos
  const services = [
    { name: "Banco de Dados", status: "online" },
    { name: "Daily.co (Video)", status: "online" },
    { name: "Pusher (Chat)", status: "online" },
    { name: "Email (SMTP)", status: "online" },
  ]

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas da Plataforma</CardTitle>
          <CardDescription>Visão geral do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  Usuários totais ({stats.activeUsers} ativos)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessões criadas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <FileText className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-xs text-muted-foreground">Posts na comunidade</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="rounded-full bg-yellow-500/10 p-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
                <p className="text-xs text-muted-foreground">Reports pendentes</p>
              </div>
            </div>
            <div className="col-span-full flex items-center gap-3 rounded-lg border p-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <UserCheck className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingTherapists}</p>
                <p className="text-xs text-muted-foreground">
                  Terapeutas aguardando aprovação
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
          <CardDescription>Integrações externas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{service.name}</span>
                <Badge
                  variant={service.status === "online" ? "default" : "destructive"}
                  className="gap-1"
                >
                  {service.status === "online" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {service.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
