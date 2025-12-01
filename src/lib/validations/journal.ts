import { z } from "zod"

export const journalPromptCategories = [
  "GRATITUDE",
  "REFLECTION",
  "GOALS",
  "EMOTIONS",
  "RELATIONSHIPS",
  "GROWTH",
  "CHALLENGES",
  "CREATIVITY",
] as const

export const journalPrompts = {
  GRATITUDE: [
    "Quais são 3 coisas pelas quais você é grato hoje?",
    "O que te fez sorrir hoje?",
    "Que pessoa ou coisa te trouxe alegria recentemente?",
    "O que você aprecia em sua rotina diária?",
  ],
  REFLECTION: [
    "Como você está se sentindo agora, realmente?",
    "O que está ocupando sua mente hoje?",
    "Quais pensamentos estão recorrendo ultimamente?",
    "Como você descreveria seu estado emocional atual?",
  ],
  GOALS: [
    "Qual é um pequeno passo que você pode dar amanhã?",
    "O que você quer alcançar esta semana?",
    "Que habilidade você gostaria de desenvolver?",
    "Como você pode se aproximar de seus objetivos?",
  ],
  EMOTIONS: [
    "Descreva uma emoção que sentiu fortemente hoje.",
    "Que emoções você notou em si mesmo recentemente?",
    "Como suas emoções influenciaram suas decisões hoje?",
    "Que gatilhos emocionais você identificou?",
  ],
  RELATIONSHIPS: [
    "Como estão seus relacionamentos mais importantes?",
    "Que conexão você gostaria de fortalecer?",
    "Como você pode mostrar mais apreço pelas pessoas próximas?",
    "Que lição você aprendeu sobre relacionamentos recentemente?",
  ],
  GROWTH: [
    "O que você aprendeu sobre si mesmo recentemente?",
    "Como você cresceu desde o ano passado?",
    "Que padrão comportamental você quer mudar?",
    "Como você está investindo em seu desenvolvimento pessoal?",
  ],
  CHALLENGES: [
    "Qual é o maior desafio que você enfrenta agora?",
    "Como você está lidando com dificuldades recentes?",
    "Que obstáculo você superou recentemente?",
    "Como você pode transformar desafios em oportunidades?",
  ],
  CREATIVITY: [
    "Se você pudesse fazer qualquer coisa amanhã, o que seria?",
    "Que projeto criativo você gostaria de iniciar?",
    "Como você pode trazer mais criatividade para sua rotina?",
    "Que ideia inovadora você teve recentemente?",
  ],
} as const

export const createJournalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  content: z.string().min(1, "Conteúdo não pode estar vazio").max(10000, "Conteúdo muito longo"),
  mood: z.number().int().min(1).max(10).optional(),
  promptId: z.string().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  isPrivate: z.boolean().default(true),
  isFavorite: z.boolean().default(false),
})

export const updateJournalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo").optional(),
  content: z.string().min(1, "Conteúdo não pode estar vazio").max(10000, "Conteúdo muito longo").optional(),
  mood: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  isPrivate: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
})

export type CreateJournalInput = z.infer<typeof createJournalSchema>
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>
export type JournalPromptCategory = typeof journalPromptCategories[number]


