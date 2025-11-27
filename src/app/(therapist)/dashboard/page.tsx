"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BarChart, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TherapistDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard do Terapeuta</h1>
        <p className="text-muted-foreground">
          Gerencie suas sessões e acompanhe seus pacientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Próxima em 30 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Taxa de comparecimento: 92%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              ⭐⭐⭐⭐⭐
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Sessões de Hoje
            </CardTitle>
            <CardDescription>Gerencie suas sessões agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">14:00 - Grupo Ansiedade</span>
                <span className="text-xs text-muted-foreground">8 participantes</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">16:00 - Sessão Individual</span>
                <span className="text-xs text-muted-foreground">João Silva</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">18:00 - Grupo Depressão</span>
                <span className="text-xs text-muted-foreground">12 participantes</span>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/therapist/sessions">Ver Todas as Sessões</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Pacientes Recentes
            </CardTitle>
            <CardDescription>Acompanhe seus pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Maria Santos</span>
                <span className="text-xs text-green-600">Ativa</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Pedro Oliveira</span>
                <span className="text-xs text-yellow-600">Em progresso</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Ana Costa</span>
                <span className="text-xs text-red-600">Atenção</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/therapist/patients">Ver Todos os Pacientes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Pendências
            </CardTitle>
            <CardDescription>Itens que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm">2 sessões precisam de reagendamento</span>
              </div>
              <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm">3 avaliações pendentes</span>
              </div>
              <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">1 relatório mensal pendente</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/therapist/schedule">Gerenciar Agenda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Mês</CardTitle>
          <CardDescription>Seu desempenho nas últimas 4 semanas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">28</div>
              <p className="text-sm text-muted-foreground">Sessões realizadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">96%</div>
              <p className="text-sm text-muted-foreground">Taxa de comparecimento</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.9</div>
              <p className="text-sm text-muted-foreground">Avaliação média</p>
            </div>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/therapist/analytics">Ver Analytics Detalhados</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
