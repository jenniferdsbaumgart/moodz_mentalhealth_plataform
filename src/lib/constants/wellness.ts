export interface Emotion {
  id: string
  label: string
  emoji?: string
  category: "positive" | "negative" | "neutral"
  color: string
}

export const PREDEFINED_EMOTIONS: Emotion[] = [
  // Positivas
  { id: "feliz", label: "Feliz", emoji: "😊", category: "positive", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "calmo", label: "Calmo", emoji: "😌", category: "positive", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "grato", label: "Grato", emoji: "🙏", category: "positive", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "animado", label: "Animado", emoji: "🤩", category: "positive", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { id: "amado", label: "Amado", emoji: "❤️", category: "positive", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "confiante", label: "Confiante", emoji: "💪", category: "positive", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },

  // Negativas
  { id: "triste", label: "Triste", emoji: "😢", category: "negative", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "ansioso", label: "Ansioso", emoji: "😰", category: "negative", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "irritado", label: "Irritado", emoji: "😠", category: "negative", color: "bg-red-200 text-red-900 border-red-300" },
  { id: "estressado", label: "Estressado", emoji: "😫", category: "negative", color: "bg-orange-200 text-orange-900 border-orange-300" },
  { id: "solitario", label: "Solitário", emoji: "😔", category: "negative", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { id: "cansado", label: "Cansado", emoji: "😴", category: "negative", color: "bg-blue-100 text-blue-900 border-blue-300" },

  // Neutras
  { id: "neutro", label: "Neutro", emoji: "😐", category: "neutral", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { id: "pensativo", label: "Pensativo", emoji: "🤔", category: "neutral", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "curioso", label: "Curioso", emoji: "👀", category: "neutral", color: "bg-purple-50 text-purple-700 border-purple-200" },
]

export interface Activity {
  id: string
  label: string
  emoji: string
  category: "work" | "health" | "social" | "leisure" | "rest"
  color: string
}

export const PREDEFINED_ACTIVITIES: Activity[] = [
  // Trabalho
  { id: "trabalho", label: "Trabalho", emoji: "💼", category: "work", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "estudo", label: "Estudo", emoji: "📚", category: "work", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "reuniao", label: "Reunião", emoji: "👥", category: "work", color: "bg-purple-100 text-purple-800 border-purple-200" },

  // Saúde
  { id: "exercicio", label: "Exercício", emoji: "🏃‍♀️", category: "health", color: "bg-red-100 text-red-800 border-red-200" },
  { id: "meditacao", label: "Meditação", emoji: "🧘‍♀️", category: "health", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { id: "dieta", label: "Cuidar da dieta", emoji: "🥗", category: "health", color: "bg-green-200 text-green-900 border-green-300" },

  // Social
  { id: "social", label: "Interação social", emoji: "👥", category: "social", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "familia", label: "Tempo em família", emoji: "👨‍👩‍👧‍👦", category: "social", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "amigos", label: "Tempo com amigos", emoji: "🎉", category: "social", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },

  // Lazer
  { id: "natureza", label: "Tempo na natureza", emoji: "🌳", category: "leisure", color: "bg-green-100 text-green-900 border-green-300" },
  { id: "leitura", label: "Leitura", emoji: "📖", category: "leisure", color: "bg-blue-200 text-blue-900 border-blue-300" },
  { id: "musica", label: "Ouvir música", emoji: "🎵", category: "leisure", color: "bg-purple-200 text-purple-900 border-purple-300" },
  { id: "hobby", label: "Hobby/Criativo", emoji: "🎨", category: "leisure", color: "bg-pink-200 text-pink-900 border-pink-300" },
  { id: "jogos", label: "Jogos", emoji: "🎮", category: "leisure", color: "bg-indigo-200 text-indigo-900 border-indigo-300" },

  // Descanso
  { id: "descanso", label: "Descanso", emoji: "😴", category: "rest", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { id: "sono", label: "Bom sono", emoji: "🌙", category: "rest", color: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "relaxar", label: "Relaxar", emoji: "🛋️", category: "rest", color: "bg-green-50 text-green-700 border-green-200" },
]

export interface MoodLevel {
  value: number
  emoji: string
  label: string
  color: string
}

export const MOOD_LEVELS: MoodLevel[] = [
  { value: 1, emoji: "😢", label: "Muito mal", color: "bg-red-500" },
  { value: 2, emoji: "😞", label: "Mal", color: "bg-red-400" },
  { value: 3, emoji: "😕", label: "Desanimado", color: "bg-orange-500" },
  { value: 4, emoji: "😐", label: "Meh", color: "bg-orange-400" },
  { value: 5, emoji: "🙂", label: "Ok", color: "bg-yellow-500" },
  { value: 6, emoji: "😊", label: "Bem", color: "bg-yellow-400" },
  { value: 7, emoji: "😄", label: "Bom", color: "bg-green-500" },
  { value: 8, emoji: "😃", label: "Muito bom", color: "bg-green-400" },
  { value: 9, emoji: "🤗", label: "Ótimo", color: "bg-blue-500" },
  { value: 10, emoji: "🥳", label: "Incrível", color: "bg-purple-500" },
]
