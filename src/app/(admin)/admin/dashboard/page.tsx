"use client"

import { useAdminDashboard } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertTriangle, Calendar, MessageSquare, Shield, UserCheck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Erro ao carregar dados</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, modere conteúdo e administre a plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.stats?.activeUsers || 0} ativos nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.pendingReports || 0}</div>
            <p className="text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.sessionsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              sessões agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terapeutas Pendentes</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.pendingTherapists || 0}</div>
            <p className="text-xs text-muted-foreground">
              aguardando aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Recentes */}
      {data?.recentPosts && data.recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Posts Recentes</CardTitle>
            <CardDescription>Atividade recente na comunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      por {post.authorName} • {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.commentCount} 💬</span>
                    <span>{post.voteCount} 👍</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <Button asChild>
              <Link href="/admin/moderation">
                <Shield className="mr-2 h-4 w-4" />
                Moderação de Conteúdo
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Usuários
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}