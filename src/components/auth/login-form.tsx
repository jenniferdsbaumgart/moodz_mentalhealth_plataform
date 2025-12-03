"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2, Mail } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const router = useRouter()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    setError("")
    setEmailNotVerified(false)
    setResendMessage("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED" || result.error.includes("EMAIL_NOT_VERIFIED")) {
          setEmailNotVerified(true)
          setError("Seu email ainda não foi verificado.")
        } else {
          setError("Credenciais inválidas")
        }
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendVerification() {
    const email = form.getValues("email")
    if (!email) {
      setResendMessage("Por favor, preencha o email acima")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResendMessage(data.message)
    } catch {
      setResendMessage("Erro ao reenviar email. Tente novamente.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta Moodz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              aria-required="true"
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p id="email-error" className="text-sm text-red-500" role="alert">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                Senha <span aria-hidden="true">*</span>
              </Label>
              <a 
                href="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p id="password-error" className="text-sm text-red-500" role="alert">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && !emailNotVerified && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {emailNotVerified && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Email não verificado
                  </p>
                  <p className="text-sm text-yellow-700">
                    Verifique sua caixa de entrada ou solicite um novo link de verificação.
                  </p>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar email de verificação
                  </>
                )}
              </Button>

              {resendMessage && (
                <p className={`text-xs text-center ${
                  resendMessage.includes("enviado") || resendMessage.includes("receberá") 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{" "}
          <a href="/register" className="text-primary hover:underline">
            Criar conta
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

