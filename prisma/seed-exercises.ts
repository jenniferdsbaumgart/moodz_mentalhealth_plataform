import { PrismaClient, ExerciseCategory, Difficulty } from "@prisma/client"

const prisma = new PrismaClient()

const exercises = [
  {
    title: "Respiração 4-7-8",
    description: "Técnica de respiração para relaxamento profundo. Inspire por 4 segundos, segure por 7 segundos, expire por 8 segundos.",
    category: ExerciseCategory.BREATHING,
    duration: 5,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Sente-se ou deite-se em uma posição confortável",
      "Coloque a ponta da língua atrás dos dentes frontais superiores",
      "Expire completamente pela boca, fazendo um som de 'whoosh'",
      "Feche a boca e inspire silenciosamente pelo nariz por 4 segundos",
      "Segure a respiração por 7 segundos",
      "Expire completamente pela boca por 8 segundos, fazendo o som de 'whoosh'",
      "Repita o ciclo 4 vezes"
    ],
    benefits: [
      "Reduz ansiedade e stress",
      "Melhora qualidade do sono",
      "Auxilia no controle emocional",
      "Promove relaxamento profundo"
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    title: "Body Scan 10 minutos",
    description: "Prática de atenção plena focada em diferentes partes do corpo para promover relaxamento e consciência corporal.",
    category: ExerciseCategory.BODY_SCAN,
    duration: 10,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Deite-se de costas em uma superfície confortável",
      "Feche os olhos e respire profundamente algumas vezes",
      "Traga sua atenção para os dedos dos pés",
      "Observe qualquer sensação sem julgamento",
      "Mova gradualmente sua atenção para cima do corpo",
      "Dedique tempo para cada área: pés, pernas, quadris, abdômen, peito, braços, mãos, pescoço e cabeça",
      "Quando sua mente divagar, gentilmente traga-a de volta para a área atual"
    ],
    benefits: [
      "Reduz tensão muscular",
      "Melhora consciência corporal",
      "Auxilia na identificação de stress",
      "Promove relaxamento profundo"
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    title: "Ancoragem 5-4-3-2-1",
    description: "Técnica de grounding para acalmar a mente ansiosa, focando nos sentidos para ancorar no presente.",
    category: ExerciseCategory.GROUNDING,
    duration: 5,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Sente-se confortavelmente e respire profundamente",
      "Nomeie 5 coisas que você pode VER ao seu redor",
      "Nomeie 4 coisas que você pode TOCAR",
      "Nomeie 3 coisas que você pode OUVIR",
      "Nomeie 2 coisas que você pode CHEIRAR",
      "Nomeie 1 coisa que você pode PROVAR",
      "Repita se necessário, focando nos detalhes sensoriais"
    ],
    benefits: [
      "Reduz ansiedade aguda",
      "Ancora no momento presente",
      "Interrompe pensamentos ruminativos",
      "Útil em situações de crise"
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    title: "Meditação da Compaixão",
    description: "Prática de meditação focada em cultivar compaixão por si mesmo e pelos outros.",
    category: ExerciseCategory.MEDITATION,
    duration: 15,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      "Sente-se confortavelmente com coluna ereta",
      "Feche os olhos e respire profundamente algumas vezes",
      "Traga à mente alguém que você ama incondicionalmente",
      "Repita frases como: 'Que você seja feliz. Que você esteja saudável. Que você viva com facilidade'",
      "Agora traga à mente você mesmo e repita as mesmas frases",
      "Por fim, expanda para incluir todas as pessoas, desejando compaixão universal",
      "Mantenha a prática por 15 minutos, retornando gentilmente quando a mente divagar"
    ],
    benefits: [
      "Aumenta auto-compaixão",
      "Reduz auto-crítica",
      "Melhora relacionamentos",
      "Promove bem-estar emocional"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Relaxamento Muscular Progressivo",
    description: "Técnica sistemática de tensão e relaxamento muscular para liberar tensão acumulada no corpo.",
    category: ExerciseCategory.RELAXATION,
    duration: 20,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      "Deite-se de costas em um local tranquilo",
      "Comece pelos pés: tensione os músculos por 5-10 segundos, depois solte",
      "Sinta a diferença entre tensão e relaxamento",
      "Mova-se progressivamente para cima: panturrilhas, coxas, quadris, abdômen, peito, braços, mãos, pescoço e rosto",
      "Dedique 20-30 segundos para cada grupo muscular",
      "Respire profundamente durante todo o processo",
      "Termine com alguns minutos de respiração consciente"
    ],
    benefits: [
      "Libera tensão muscular crônica",
      "Reduz sintomas de ansiedade",
      "Melhora qualidade do sono",
      "Ajuda no gerenciamento do stress"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Visualização Guiada",
    description: "Jornada mental para um lugar tranquilo e pacífico, usando imaginação para promover relaxamento.",
    category: ExerciseCategory.VISUALIZATION,
    duration: 15,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Sente-se ou deite-se confortavelmente",
      "Feche os olhos e respire profundamente",
      "Imagine-se em um lugar tranquilo da natureza (praia, floresta, montanha)",
      "Explore detalhadamente: cores, sons, texturas, cheiros",
      "Permita-se sentir a paz e tranquilidade deste lugar",
      "Se surgir qualquer tensão, imagine-a dissolvendo-se",
      "Permaneça neste lugar por 10-15 minutos",
      "Retorne gentilmente quando estiver pronto"
    ],
    benefits: [
      "Reduz stress e ansiedade",
      "Melhora concentração",
      "Promove criatividade",
      "Auxilia na recuperação emocional"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Respiração Abdominal",
    description: "Prática básica de respiração consciente focada no movimento do diafragma para promover calma.",
    category: ExerciseCategory.BREATHING,
    duration: 10,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Deite-se de costas com joelhos dobrados",
      "Coloque uma mão no abdômen e outra no peito",
      "Respire profundamente pelo nariz, sentindo o abdômen elevar-se",
      "Expire lentamente pela boca, sentindo o abdômen abaixar",
      "Mantenha o peito relativamente imóvel",
      "Continue por 5-10 minutos, focando na respiração",
      "Observe como o corpo relaxa naturalmente"
    ],
    benefits: [
      "Reduz frequência cardíaca",
      "Melhora oxigenação",
      "Promove relaxamento",
      "Aumenta consciência corporal"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Mindful Walking",
    description: "Prática de caminhada consciente, prestando atenção plena a cada passo e sensação.",
    category: ExerciseCategory.MINDFUL_MOVEMENT,
    duration: 15,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Encontre um espaço seguro para caminhar (pode ser indoor)",
      "Comece caminhando lentamente, prestando atenção aos pés tocando o chão",
      "Observe a sensação de cada passo: levantamento, movimento para frente, contato",
      "Sinta o movimento das pernas, quadris e braços",
      "Esteja ciente da respiração enquanto caminha",
      "Se a mente divagar, gentilmente traga-a de volta para as sensações da caminhada",
      "Continue por 10-15 minutos em silêncio"
    ],
    benefits: [
      "Melhora foco e concentração",
      "Reduz ruminação mental",
      "Conecta mente e corpo",
      "Útil para ansiedade"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Meditação dos Sons",
    description: "Prática de atenção plena focada nos sons ao redor, desenvolvendo presença auditiva.",
    category: ExerciseCategory.MEDITATION,
    duration: 12,
    difficulty: Difficulty.BEGINNER,
    instructions: [
      "Sente-se confortavelmente em um lugar tranquilo",
      "Feche os olhos se desejar, ou mantenha-os suavemente abertos",
      "Traga sua atenção para os sons próximos",
      "Observe sem julgar: alto/baixo, próximo/distante, agradável/desagradável",
      "Quando identificar um som, nomeie-o mentalmente",
      "Permita que os sons venham e vão como ondas",
      "Se surgirem pensamentos, observe-os e retorne aos sons",
      "Continue por 10-12 minutos"
    ],
    benefits: [
      "Desenvolve atenção plena",
      "Reduz julgamentos automáticos",
      "Aumenta presença no momento",
      "Melhora percepção sensorial"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Ancoragem com Âncoras Sensoriais",
    description: "Técnica avançada de grounding usando objetos pessoais como âncoras para estabilidade emocional.",
    category: ExerciseCategory.GROUNDING,
    duration: 8,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      "Escolha 3-5 objetos pessoais significativos",
      "Sente-se confortavelmente e segure o primeiro objeto",
      "Explore-o com todos os sentidos: forma, textura, peso, temperatura",
      "Conecte o objeto a memórias positivas ou qualidades estáveis",
      "Repita com cada objeto, criando associações positivas",
      "Quando sentir ansiedade, visualize ou toque nestes objetos",
      "Use esta técnica durante momentos de crise emocional",
      "Pratique diariamente para fortalecer as associações"
    ],
    benefits: [
      "Cria âncoras emocionais estáveis",
      "Útil para TEPT e ansiedade",
      "Fornece ferramentas portáteis",
      "Conecta objetos a estados positivos"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Relaxamento Autogênico",
    description: "Técnica de relaxamento através de sugestões mentais focadas em diferentes partes do corpo.",
    category: ExerciseCategory.RELAXATION,
    duration: 20,
    difficulty: Difficulty.INTERMEDIATE,
    instructions: [
      "Deite-se de costas em local tranquilo e confortável",
      "Feche os olhos e respire profundamente algumas vezes",
      "Repita mentalmente: 'Meus braços estão pesados e relaxados'",
      "Continue com: 'Meus braços estão quentes e relaxados'",
      "Mova-se sistematicamente pelo corpo: pernas, abdômen, peito, braços, pescoço, rosto",
      "Para cada área, repita as sugestões de peso, calor e relaxamento",
      "Se a mente divagar, gentilmente retorne às frases",
      "Termine com algumas respirações profundas"
    ],
    benefits: [
      "Relaxamento profundo e sistemático",
      "Reduz sintomas de stress crônico",
      "Melhora controle autonômico",
      "Útil para insônia e ansiedade"
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Visualização da Luz",
    description: "Prática avançada de visualização usando luz dourada para limpeza energética e relaxamento.",
    category: ExerciseCategory.VISUALIZATION,
    duration: 18,
    difficulty: Difficulty.ADVANCED,
    instructions: [
      "Sente-se ou deite-se confortavelmente no escuro",
      "Feche os olhos e respire profundamente por alguns minutos",
      "Imagine uma luz dourada brilhante acima de sua cabeça",
      "Visualize esta luz descendo lentamente pela sua cabeça",
      "Sinta a luz preenchendo cada célula com calor e relaxamento",
      "Permita que a luz desça pelo pescoço, ombros, braços, peito, abdômen, pernas",
      "Observe qualquer tensão dissolvendo-se na luz dourada",
      "Quando a luz alcançar os pés, imagine-a irradiando para o chão",
      "Permaneça alguns minutos na sensação de limpeza e paz"
    ],
    benefits: [
      "Limpeza energética profunda",
      "Relaxamento espiritual",
      "Reduz energia negativa",
      "Promove sensação de paz interior"
    ],
    isActive: true,
    isFeatured: false,
  },
]

export async function seedExercises() {
  console.log("Seeding mindfulness exercises...")

  for (const exercise of exercises) {
    const existing = await prisma.mindfulnessExercise.findFirst({
      where: { title: exercise.title }
    })

    if (!existing) {
      await prisma.mindfulnessExercise.create({
        data: exercise,
      })
    } else {
      console.log(`Exercise "${exercise.title}" already exists, skipping...`)
    }
  }

  console.log(`Seeded ${exercises.length} mindfulness exercises`)
}
