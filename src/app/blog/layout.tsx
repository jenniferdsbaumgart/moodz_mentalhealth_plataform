import { Providers } from "@/components/providers"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: {
        default: "Blog | Moodz",
        template: "%s | Blog Moodz"
    },
    description: "Artigos e dicas sobre saúde mental, bem-estar emocional e mindfulness.",
}

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Providers>
            <div className="min-h-screen">
                {/* Simple header for blog */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center justify-between">
                        <a href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-semibold text-primary">Moodz</span>
                        </a>
                        <nav className="flex items-center gap-4">
                            <a href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                                Blog
                            </a>
                            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                Entrar
                            </a>
                        </nav>
                    </div>
                </header>
                <main>{children}</main>
                {/* Simple footer */}
                <footer className="border-t py-8 mt-8">
                    <div className="container text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Moodz. Todos os direitos reservados.
                    </div>
                </footer>
            </div>
        </Providers>
    )
}
