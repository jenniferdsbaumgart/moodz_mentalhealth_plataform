"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, Mail, ArrowLeft } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordForm) {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSubmittedEmail(data.email)
        setSuccess(true)
      } else if (responseData.rateLimited) {
        setError(responseData.message)
      } else {
        // Por segurança, mostrar sucesso mesmo se o email não existir
        setSubmittedEmail(data.email)
        setSuccess(true)
      }
    } catch {
      setError("Erro ao processar solicitação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Email Enviado!</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{submittedEmail}</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Se este email estiver cadastrado, você receberá um link para redefinir sua senha.
            O link expira em 1 hora.
          </p>

          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <a href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Não recebeu o email? Verifique sua pasta de spam ou{" "}
              <button 
                onClick={() => {
                  setSuccess(false)
                  form.reset()
                }}
                className="text-primary hover:underline"
              >
                tente novamente
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Esqueceu sua senha?</CardTitle>
        <CardDescription>
          Informe seu email para receber um link de redefinição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Link de Redefinição"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-primary hover:underline inline-flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para o Login
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

