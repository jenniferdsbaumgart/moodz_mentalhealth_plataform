import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Ana Silva",
    role: "Membro há 6 meses",
    content: "O Moodz mudou minha vida. Encontrei um grupo de apoio que realmente me entende e me sinto segura para compartilhar meus sentimentos.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Carlos Mendes",
    role: "Membro há 1 ano",
    content: "A facilidade de acessar terapia em grupo e o conteúdo educativo me ajudaram a entender melhor minha ansiedade. Recomendo para todos.",
    rating: 5,
    avatar: "C",
  },
  {
    name: "Mariana Costa",
    role: "Membro há 3 meses",
    content: "Adoro as ferramentas de diário e humor. Elas me ajudam a manter o controle do meu dia a dia. A comunidade é muito acolhedora.",
    rating: 4,
    avatar: "M",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            O que dizem nossos membros
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de pessoas que transformaram suas vidas com o Moodz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="bg-background border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? "fill-primary text-primary" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

