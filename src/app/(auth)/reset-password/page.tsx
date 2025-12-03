"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, KeyRound, AlertTriangle } from "lucide-react"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

type PageState = "form" | "loading" | "success" | "error" | "expired" | "no-token"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [state, setState] = useState<PageState>(token ? "form" : "no-token")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) return

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          password: data.password 
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        setState("success")
      } else if (responseData.expired) {
        setState("expired")
        setErrorMessage(responseData.message)
      } else {
        setState("error")
        setErrorMessage(responseData.message)
      }
    } catch {
      setState("error")
      setErrorMessage("Erro ao redefinir senha. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estado: Sem token
  if (state === "no-token") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-600">Link Inválido</CardTitle>
          <CardDescription>
            O link de redefinição de senha é inválido ou está faltando.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <a href="/forgot-password">Solicitar Novo Link</a>
          </Button>
          <div className="text-center">
            <a href="/login" className="text-sm text-primary hover:underline">
              Voltar para o Login
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Sucesso
  if (state === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Senha Redefinida!</CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Agora você pode fazer login com sua nova senha.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir para Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Estado: Token expirado
  if (state === "expired") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-600">Link Expirado</CardTitle>
          <CardDescription>
            {errorMessage || "O link de redefinição expirou."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <a href="/forgot-password">Solicitar Novo Link</a>
          </Button>
          <div className="text-center">
            <a href="/login" className="text-sm text-primary hover:underline">
              Voltar para o Login
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Erro
  if (state === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Erro na Redefinição</CardTitle>
          <CardDescription>
            {errorMessage || "Não foi possível redefinir sua senha."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <a href="/forgot-password">Solicitar Novo Link</a>
          </Button>
          <div className="text-center">
            <a href="/login" className="text-sm text-primary hover:underline">
              Voltar para o Login
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado: Formulário
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Redefinir Senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Redefinir Senha"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-primary hover:underline">
            Voltar para o Login
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

