import { Users, MessageSquare, Heart, BookOpen, ShieldCheck, Sparkles } from "lucide-react"

const features = [
  {
    name: "Terapia em Grupo",
    description: "Sessões guiadas por profissionais experientes em um ambiente acolhedor e seguro.",
    icon: Users,
  },
  {
    name: "Comunidade de Apoio",
    description: "Conecte-se com pessoas que compartilham experiências similares e oferecem suporte mútuo.",
    icon: MessageSquare,
  },
  {
    name: "Jornada de Bem-estar",
    description: "Ferramentas diárias de monitoramento de humor, diário e exercícios de mindfulness.",
    icon: Heart,
  },
  {
    name: "Conteúdo Especializado",
    description: "Acesso a artigos, vídeos e recursos educativos sobre saúde mental validados por especialistas.",
    icon: BookOpen,
  },
  {
    name: "Segurança e Privacidade",
    description: "Seus dados e conversas são protegidos com criptografia de ponta a ponta e anonimato opcional.",
    icon: ShieldCheck,
  },
  {
    name: "Gamificação Positiva",
    description: "Conquiste emblemas e acompanhe seu progresso de forma leve e motivadora.",
    icon: Sparkles,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Tudo que você precisa para sua saúde mental
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma abordagem holística que combina suporte profissional, conexão humana e ferramentas de autocuidado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="relative p-8 bg-background rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-5 text-primary">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

