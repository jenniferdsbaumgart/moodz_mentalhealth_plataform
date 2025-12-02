"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Mail, ArrowLeft } from "lucide-react"

export default function PendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Cadastro em Análise</CardTitle>
          <CardDescription>
            Estamos revisando suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-left space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Verificação por Email</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um email de confirmação para você
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Revisão Manual</p>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe analisará seu CRP e documentação
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>O que acontece agora?</strong><br />
              1. Verifique seu email e confirme sua conta<br />
              2. Aguarde a aprovação (até 48h úteis)<br />
              3. Receberá um email quando aprovado
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Ir para Login
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Dúvidas? Entre em contato conosco em suporte@moodz.com.br
          </p>
        </CardContent>
      </Card>
    </div>
  )
}



