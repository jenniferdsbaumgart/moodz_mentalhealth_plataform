"use client"

import { usePatientDashboard } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Heart, BookOpen, Trophy, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PatientDashboard() {
  const { data, isLoading, error } = usePatientDashboard()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Erro ao carregar dados</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, Paciente!</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta à sua jornada de bem-estar mental
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data?.upcomingSessions?.[0] ? (
              <div>
                <div className="text-lg font-bold">{data.upcomingSessions[0].title}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(data.upcomingSessions[0].scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Nenhuma sessão agendada</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nível {data?.stats?.level || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.streak || 0}</div>
            <p className="text-xs text-muted-foreground">
              dias consecutivos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Calendar className="mx-auto h-8 w-8 text-primary" />
            <CardTitle className="text-lg">Próxima Sessão</CardTitle>
            <CardDescription>Ver sessões disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/sessions">Ver Sessões</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-secondary" />
            <CardTitle className="text-lg">Comunidade</CardTitle>
            <CardDescription>Conecte-se com outros</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/community">Explorar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Heart className="mx-auto h-8 w-8 text-accent" />
            <CardTitle className="text-lg">Bem-estar</CardTitle>
            <CardDescription>Ferramentas diárias</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/wellness">Acessar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BookOpen className="mx-auto h-8 w-8 text-success" />
            <CardTitle className="text-lg">Blog</CardTitle>
            <CardDescription>Artigos e dicas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/blog">Ler</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Badges */}
      {data?.recentBadges && data.recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Recentes</CardTitle>
            <CardDescription>Badges que você desbloqueou recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recentBadges.map((badge: any) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(badge.earnedAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Sessões */}
      {data?.upcomingSessions && data.upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Sessões</CardTitle>
            <CardDescription>Sessões que você está inscrito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      com {session.therapistName} • {format(new Date(session.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/sessions/${session.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

