import { UserPlus, Search, CalendarCheck, Smile } from "lucide-react"

const steps = [
  {
    title: "Crie sua conta gratuita",
    description: "Cadastre-se em poucos segundos e personalize seu perfil com suas preferências e objetivos.",
    icon: UserPlus,
  },
  {
    title: "Explore a plataforma",
    description: "Navegue pelos grupos de apoio, artigos educativos e ferramentas de bem-estar disponíveis.",
    icon: Search,
  },
  {
    title: "Participe de sessões",
    description: "Agende ou entre em sessões de terapia em grupo moderadas por profissionais qualificados.",
    icon: CalendarCheck,
  },
  {
    title: "Sinta-se melhor",
    description: "Acompanhe seu progresso, ganhe conquistas e faça parte de uma comunidade que se apoia.",
    icon: Smile,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Como funciona o Moodz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Começar sua jornada de saúde mental nunca foi tão simples.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-muted -z-10" />
          
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center bg-background">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-6 border-4 border-background relative z-10">
                <step.icon className="h-10 w-10" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm border-4 border-background">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

