"use client" // Error components must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
                Algo deu errado
            </h1>
            <p className="mb-8 max-w-md text-muted-foreground">
                Encontramos um erro inesperado. Tente recarregar a página ou voltar para o início.
            </p>
            <div className="flex gap-4">
                <Button onClick={reset} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                </Button>
                <Button asChild className="gap-2">
                    <a href="/dashboard">
                        <Home className="h-4 w-4" />
                        Voltar ao Início
                    </a>
                </Button>
            </div>
        </div>
    )
}
