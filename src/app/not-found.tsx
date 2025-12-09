import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
                Página não encontrada
            </h1>
            <p className="mb-8 max-w-md text-muted-foreground">
                Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido removida ou o link está incorreto.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" />
                        Voltar ao Início
                    </Link>
                </Button>
            </div>
        </div>
    )
}
