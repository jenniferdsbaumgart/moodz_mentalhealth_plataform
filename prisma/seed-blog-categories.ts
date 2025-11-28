import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const blogCategories = [
  {
    name: 'Saúde Mental',
    slug: 'saude-mental',
    description: 'Artigos sobre saúde mental geral, prevenção e bem-estar',
    color: '#3b82f6', // blue-500
    icon: 'Heart',
    order: 1,
  },
  {
    name: 'Ansiedade',
    slug: 'ansiedade',
    description: 'Conteúdo sobre ansiedade, sintomas e estratégias de manejo',
    color: '#f59e0b', // amber-500
    icon: 'Zap',
    order: 2,
  },
  {
    name: 'Depressão',
    slug: 'depressao',
    description: 'Informações sobre depressão, tratamento e recuperação',
    color: '#6366f1', // indigo-500
    icon: 'CloudRain',
    order: 3,
  },
  {
    name: 'Relacionamentos',
    slug: 'relacionamentos',
    description: 'Saúde mental nos relacionamentos e comunicação saudável',
    color: '#ec4899', // pink-500
    icon: 'Users',
    order: 4,
  },
  {
    name: 'Mindfulness',
    slug: 'mindfulness',
    description: 'Práticas de mindfulness e meditação para bem-estar',
    color: '#10b981', // emerald-500
    icon: 'Leaf',
    order: 5,
  },
  {
    name: 'Autoestima',
    slug: 'autoestima',
    description: 'Desenvolvimento da autoestima e autoconfiança',
    color: '#f97316', // orange-500
    icon: 'Star',
    order: 6,
  },
  {
    name: 'Sono',
    slug: 'sono',
    description: 'Saúde do sono e insônia, dicas para melhor descanso',
    color: '#8b5cf6', // violet-500
    icon: 'Moon',
    order: 7,
  },
  {
    name: 'Trabalho',
    slug: 'trabalho',
    description: 'Saúde mental no ambiente de trabalho e equilíbrio',
    color: '#06b6d4', // cyan-500
    icon: 'Briefcase',
    order: 8,
  },
]

export async function seedBlogCategories() {
  console.log('🌱 Seeding blog categories...')

  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log('✅ Blog categories seeded successfully')
}
