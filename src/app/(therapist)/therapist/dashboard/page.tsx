"use client"

import { useTherapistDashboard } from "@/hooks/use-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, TrendingUp, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function TherapistDashboardPage() {
  const { data, isLoading, error } = useTherapistDashboard()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Erro ao carregar dados</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Terapeuta</h1>
        <p className="text-muted-foreground">
          Gerencie suas sessões, pacientes e acompanhe seu progresso
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Sessão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data?.stats?.nextSessionDate ? (
              <div className="text-2xl font-bold">
                {format(new Date(data.stats.nextSessionDate), "dd/MM", { locale: ptBR })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Nenhuma agendada</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">pacientes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões no Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.sessionsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">sessões realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Agendadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.upcomingCount || 0}</div>
            <p className="text-xs text-muted-foreground">próximas sessões</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Sessões */}
      {data?.upcomingSessions && data.upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Sessões</CardTitle>
            <CardDescription>Sessões que você irá conduzir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {session.participantCount}/{session.maxParticipants} participantes
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/therapist/sessions/${session.id}`}>Gerenciar</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessões Recentes */}
      {data?.recentSessions && data.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões Recentes</CardTitle>
            <CardDescription>Suas últimas sessões realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })} • {session.participantCount} participantes
                    </p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Concluída</span>
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
          <CardDescription>Gerencie suas sessões e pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <Button asChild>
              <Link href="/therapist/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Sessão
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/therapist/sessions">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Minhas Sessões
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}