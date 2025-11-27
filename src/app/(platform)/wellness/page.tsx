"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  BookOpen,
  Brain,
  TrendingUp,
  Calendar,
  BarChart3,
  Plus,
  Target,
  Sparkles,
  Trophy
} from "lucide-react"
import { useGamificationStats } from "@/hooks/use-wellness"

export default function WellnessPage() {
  const { data: gamificationData } = useGamificationStats()

  const wellnessFeatures = [
    {
      title: "Rastreamento de Humor",
      description: "Registre seu humor diário e acompanhe padrões emocionais",
      icon: Heart,
      href: "/wellness/mood",
      color: "bg-red-100 text-red-600",
      features: ["Escalas visuais", "Rastreamento semanal", "Insights personalizados"]
    },
    {
      title: "Diário Emocional",
      description: "Escreva sobre seus sentimentos e experiências diárias",
      icon: BookOpen,
      href: "/wellness/journal",
      color: "bg-blue-100 text-blue-600",
      features: ["Prompts guiados", "Privacidade total", "Análise de sentimentos"]
    },
    {
      title: "Exercícios Mindfulness",
      description: "Práticas guiadas para reduzir stress e melhorar o foco",
      icon: Brain,
      href: "/wellness/mindfulness",
      color: "bg-purple-100 text-purple-600",
      features: ["Meditações guiadas", "Exercícios respiratórios", "Acompanhamento de progresso"]
    },
    {
      title: "Estatísticas de Bem-estar",
      description: "Visualize tendências e padrões do seu bem-estar",
      icon: TrendingUp,
      href: "/wellness/stats",
      color: "bg-green-100 text-green-600",
      features: ["Gráficos interativos", "Relatórios mensais", "Metas personalizadas"]
    }
  ]

  const quickStats = [
    {
      label: "Pontos Totais",
      value: gamificationData?.data?.points?.toString() || "0",
      change: "🏆",
      icon: Trophy
    },
    {
      label: "Sequência de Humor",
      value: gamificationData?.data?.moodStreak?.toString() || "0",
      change: "dias consecutivos",
      icon: Calendar
    },
    {
      label: "Badges Conquistadas",
      value: gamificationData?.data?.badges?.length?.toString() || "0",
      change: "de 7 disponíveis",
      icon: Target
    },
    {
      label: "Nível Atual",
      value: gamificationData?.data?.level?.toString() || "1",
      change: "Continue ganhando pontos!",
      icon: TrendingUp
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Centro de Bem-estar</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cuide da sua saúde mental com ferramentas práticas para rastrear emoções,
            praticar mindfulness e desenvolver hábitos positivos.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-green-600">
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Mood Check-in */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Check-in Diário de Humor
            </CardTitle>
            <CardDescription>
              Como você está se sentindo hoje? Leva apenas 2 minutos para registrar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">📊</div>
                  <div className="text-sm text-muted-foreground">Aguardando registro</div>
                </div>
                <div>
                  <p className="font-medium">Registre seu humor de hoje</p>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe padrões e melhore sua consciência emocional
                  </p>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/wellness/mood">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Humor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wellnessFeatures.map((feature) => (
            <Card key={feature.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {feature.features.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={feature.href}>
                      Acessar {feature.title}
                    </Link>
                  </Button>
                  {feature.href === "/wellness/mood" && (
                    <Button variant="outline" size="sm" asChild className="w-full mt-2">
                      <Link href="/wellness/mood/stats">
                        Ver Estatísticas
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Goals & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas e Conquistas
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso e celebre suas vitórias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-medium">Sequência de 7 dias</div>
                <div className="text-sm text-muted-foreground">Conquista desbloqueada!</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium">Melhoria de humor</div>
                <div className="text-sm text-muted-foreground">+15% esta semana</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl mb-2">🧘‍♀️</div>
                <div className="font-medium">5 exercícios feitos</div>
                <div className="text-sm text-muted-foreground">Continue assim!</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Heart className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Humor registrado</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
                <Badge variant="outline">7/10</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Entrada no diário</p>
                  <p className="text-xs text-muted-foreground">Ontem</p>
                </div>
                <Badge variant="outline">Privada</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Brain className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Meditação concluída</p>
                  <p className="text-xs text-muted-foreground">2 dias atrás</p>
                </div>
                <Badge variant="outline">10 min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Reminders */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
              Dica do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              &quot;A prática consistente de rastreamento de humor pode ajudar a identificar padrões
              e gatilhos emocionais, permitindo intervenções mais eficazes.&quot;
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Estudos mostram que o rastreamento regular melhora a consciência emocional em até 40%.
              </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/wellness/mood/stats">
              Ver estatísticas
            </Link>
          </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
