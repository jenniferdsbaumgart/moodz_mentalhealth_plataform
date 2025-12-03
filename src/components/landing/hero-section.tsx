import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-20 lg:pt-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background" />
      
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
            <Shield className="mr-2 h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm">Espaço seguro e confidencial</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Encontre paz interior e conexão genuína
          </h1>
          
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Uma plataforma completa de saúde mental que une terapia em grupo, comunidade de apoio e ferramentas de bem-estar para sua jornada.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/register">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link href="#how-it-works">
                Como Funciona
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                   {/* Placeholder avatars using colorful gradients/solid colors */}
                   <div className={`h-full w-full bg-gradient-to-br from-primary/${20 + i*10} to-secondary/${20 + i*10}`} />
                </div>
              ))}
            </div>
            <div>
              <span className="font-bold text-foreground">+500</span> pessoas ajudadas
            </div>
          </div>
        </div>
        
        {/* Abstract visual representation */}
        <div className="mt-16 flow-root sm:mt-24">
          <div className="rounded-xl bg-muted/50 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
             <div className="aspect-[16/9] w-full rounded-lg bg-gradient-to-br from-primary/5 via-muted to-secondary/5 flex items-center justify-center border border-border/50 shadow-sm">
                <span className="text-muted-foreground/50 font-medium">Visualização da Plataforma</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

