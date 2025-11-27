"use client"

import { useUserProfile } from "@/hooks/use-user-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Heart, BookOpen, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function PatientDashboard() {
  const { profile, isLoading } = useUserProfile()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {profile?.name || "Paciente"}!</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta à sua jornada de bem-estar mental
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Participadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde a última semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.patientProfile?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nível {profile?.patientProfile?.level || 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.patientProfile?.streak || 0}</div>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Seu progresso nos últimos dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Participou de sessão de grupo</p>
                <p className="text-xs text-muted-foreground">2 dias atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Completou exercício de mindfulness</p>
                <p className="text-xs text-muted-foreground">3 dias atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Ganhou 50 pontos</p>
                <p className="text-xs text-muted-foreground">5 dias atrás</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
