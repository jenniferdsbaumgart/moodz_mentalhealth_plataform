"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, Mail, AlertTriangle } from "lucide-react"

type VerificationState = "loading" | "success" | "error" | "expired" | "no-token"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [state, setState] = useState<VerificationState>(token ? "loading" : "no-token")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  async function verifyEmail(verificationToken: string) {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setState("success")
        setMessage(data.message)
      } else if (data.expired) {
        setState("expired")
        setMessage(data.message)
      } else {
        setState("error")
        setMessage(data.message)
      }
    } catch {
      setState("error")
      setMessage("Erro ao verificar email. Tente novamente.")
    }
  }

  async function handleResend() {
    if (!email) {
      setResendMessage("Por favor, informe seu email")
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
      <CardHeader className="text-center">
        {state === "loading" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <CardTitle>Verificando Email</CardTitle>
            <CardDescription>Aguarde enquanto verificamos seu email...</CardDescription>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Verificado!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Erro na Verificação</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}

        {state === "expired" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-600">Link Expirado</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}

        {state === "no-token" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Verificação de Email</CardTitle>
            <CardDescription>
              Informe seu email para receber um novo link de verificação
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {state === "success" && (
          <Button
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Ir para Login
          </Button>
        )}

        {(state === "expired" || state === "error" || state === "no-token") && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Reenviar Email de Verificação"
              )}
            </Button>

            {resendMessage && (
              <p className={`text-sm text-center ${
                resendMessage.includes("enviado") ? "text-green-600" : "text-red-600"
              }`}>
                {resendMessage}
              </p>
            )}

            <div className="text-center">
              <a href="/login" className="text-sm text-primary hover:underline">
                Voltar para o Login
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

