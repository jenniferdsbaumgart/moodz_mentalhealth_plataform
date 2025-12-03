import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    name: "Gratuito",
    description: "Para quem está começando a cuidar da saúde mental.",
    price: "R$ 0",
    period: "/mês",
    features: [
      "Acesso à comunidade",
      "3 sessões de grupo por mês",
      "Diário de humor básico",
      "Artigos educativos",
    ],
    cta: "Começar Grátis",
    ctaVariant: "outline" as const,
    href: "/register",
  },
  {
    name: "Premium",
    description: "Acesso ilimitado a todas as ferramentas e sessões.",
    price: "R$ 29,90",
    period: "/mês",
    features: [
      "Sessões de grupo ilimitadas",
      "Ferramentas avançadas de bem-estar",
      "Relatórios mensais de progresso",
      "Conteúdo exclusivo em vídeo",
      "Suporte prioritário",
    ],
    cta: "Assinar Premium",
    ctaVariant: "default" as const,
    popular: true,
    href: "/register?plan=premium",
  },
  {
    name: "Profissional",
    description: "Para terapeutas que desejam expandir sua atuação.",
    price: "R$ 89,90",
    period: "/mês",
    features: [
      "Perfil profissional destacado",
      "Gestão de pacientes",
      "Ferramentas de agendamento",
      "Blog profissional",
      "Pagamentos integrados",
    ],
    cta: "Sou Terapeuta",
    ctaVariant: "outline" as const,
    href: "/register?role=therapist",
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Planos para todos os momentos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano que melhor se adapta às suas necessidades e comece sua jornada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col relative ${
                plan.popular ? "border-primary shadow-lg scale-105 z-10" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Mais Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.ctaVariant}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

