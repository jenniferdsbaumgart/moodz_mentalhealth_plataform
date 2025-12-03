import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="container px-4 md:px-6 py-12 mx-auto">
        {/* CTA Final */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Pronto para cuidar de você?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão transformando suas vidas com o Moodz.
          </p>
          <Button size="lg" className="px-8" asChild>
            <Link href="/register">Começar Gratuitamente</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span className="font-bold text-xl">Moodz</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sua plataforma de saúde mental completa, acessível e acolhedora.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground">Funcionalidades</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground">Como Funciona</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground">Preços</Link></li>
              <li><Link href="/therapists" className="hover:text-foreground">Para Terapeutas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="/community" className="hover:text-foreground">Comunidade</Link></li>
              <li><Link href="/help" className="hover:text-foreground">Central de Ajuda</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacidade</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Moodz. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social links placeholder */}
            <Link href="#" aria-label="Instagram" className="hover:text-foreground">Instagram</Link>
            <Link href="#" aria-label="Twitter" className="hover:text-foreground">Twitter</Link>
            <Link href="#" aria-label="LinkedIn" className="hover:text-foreground">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

