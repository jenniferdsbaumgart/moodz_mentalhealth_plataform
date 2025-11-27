"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, MessageSquare, BookOpen } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Bem-vindo ao Moodz
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sua plataforma de saúde mental com terapia em grupo, comunidade e ferramentas de bem-estar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Users className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Terapia em Grupo</CardTitle>
              <CardDescription>
                Sessões de terapia coletiva por vídeo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/login">Participar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-secondary" />
              <CardTitle>Comunidade</CardTitle>
              <CardDescription>
                Conecte-se com pessoas que entendem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/login">Explorar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="mx-auto h-12 w-12 text-accent" />
              <CardTitle>Bem-estar</CardTitle>
              <CardDescription>
                Ferramentas para cuidar da sua saúde mental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/login">Descobrir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-success" />
              <CardTitle>Conteúdo Educacional</CardTitle>
              <CardDescription>
                Artigos e recursos sobre saúde mental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/blog">Ler Blog</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Pronto para começar sua jornada?
          </h2>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Criar Conta</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
