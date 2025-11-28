"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useReports } from "@/hooks/use-admin"
import {
  AlertTriangle,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react"

export default function ModerationDashboard() {
  // Get pending reports count
  const { data: pendingReports } = useReports("PENDING", 1, 1)

  const stats = {
    pendingReports: pendingReports?.pagination?.total || 0,
    totalPosts: 156, // Mock data - would come from API
    totalComments: 892, // Mock data - would come from API
    bannedUsers: 3, // Mock data - would come from API
    resolvedToday: 12, // Mock data - would come from API
  }

  const recentActions = [
    {
      id: "1",
      action: "Post deletado",
      content: "Spam de produto",
      user: "João Silva",
      time: "2 horas atrás",
      type: "removal",
    },
    {
      id: "2",
      action: "Usuário banido",
      content: "Discurso de ódio",
      user: "Maria Santos",
      time: "4 horas atrás",
      type: "ban",
    },
    {
      id: "3",
      action: "Comentário deletado",
      content: "Conteúdo inapropriado",
      user: "Pedro Costa",
      time: "6 horas atrás",
      type: "removal",
    },
    {
      id: "4",
      action: "Relatório dispensado",
      content: "Denúncia infundada",
      user: "Ana Oliveira",
      time: "8 horas atrás",
      type: "dismiss",
    },
  ]

  const getActionIcon = (type: string) => {
    switch (type) {
      case "removal":
        return <FileText className="h-4 w-4" />
      case "ban":
        return <Ban className="h-4 w-4" />
      case "dismiss":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case "removal":
        return "text-red-600"
      case "ban":
        return "text-red-700"
      case "dismiss":
        return "text-green-600"
      default:
        return "text-orange-600"
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Moderação</h1>
            <p className="text-muted-foreground">
              Monitore e gerencie a saúde da comunidade
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Relatórios Pendentes
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pendingReports}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando análise
                </p>
                {stats.pendingReports > 0 && (
                  <Button asChild size="sm" className="mt-2 w-full">
                    <Link href="/admin/moderation/reports">
                      Ver relatórios
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Posts Ativos
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  Na comunidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Comentários
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <p className="text-xs text-muted-foreground">
                  Interações totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Banidos
                </CardTitle>
                <Ban className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Atualmente banidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ações Recentes
                </CardTitle>
                <CardDescription>
                  Últimas ações de moderação realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 ${getActionColor(action.type)}`}>
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {action.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {action.content} • {action.user}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {action.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/admin/moderation/reports">
                    Ver todas as ações
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Ferramentas de moderação frequentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/moderation/reports">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Revisar Relatórios Pendentes
                    {stats.pendingReports > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stats.pendingReports}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Link>
                </Button>

                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/content">
                    <FileText className="h-4 w-4 mr-2" />
                    Moderar Conteúdo
                  </Link>
                </Button>

                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>
                Eficiência da equipe de moderação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.resolvedToday}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Relatórios resolvidos hoje
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    2.3h
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    94%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Taxa de resolução
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

