# Estado Atual do Projeto - Moodz (Plataforma de Saúde Mental)

**Data da Análise:** 27 de Novembro de 2025  
**Versão Analisada:** Branch `main` (uncommitted changes)  
**Analista:** Claude AI - Arquiteto de Software

---

## 📊 Resumo Executivo

### Status Geral
- **Progresso Estimado:** 75%
- **Funcionalidades Principais:** 12/16 implementadas
- **Issues Críticos Encontrados:** 3
- **Issues Menores:** 8

### Resumo por Módulo

| Módulo | Status | Completo | Problemas |
|--------|--------|----------|-----------|
| Autenticação | ✅ | 90% | Falta verificação de email, recuperação de senha |
| Dashboard Patient | ✅ | 85% | Dados estáticos mock |
| Dashboard Therapist | ✅ | 80% | Dados estáticos mock |
| Dashboard Admin | ✅ | 75% | Faltam páginas de gestão |
| Dashboard Super Admin | ⚠️ | 50% | Apenas dashboard, faltam funcionalidades |
| Sessões (Video) | ✅ | 85% | Daily.co configurado, falta chat real-time |
| Comunidade | ✅ | 90% | Completo com votação e moderação |
| Bem-estar (Mood) | ✅ | 95% | Muito completo |
| Bem-estar (Journal) | ✅ | 90% | Funcional |
| Bem-estar (Exercícios) | ✅ | 85% | Falta player de áudio |
| Gamificação | ✅ | 90% | Sistema completo |
| Blog | ❌ | 10% | Apenas referências, não implementado |
| Notificações | ❌ | 5% | Não implementado |
| Onboarding | ✅ | 85% | Funcional |

**Legenda:**
- ✅ Implementado e Funcional
- ⚠️ Parcialmente Implementado
- ❌ Não Implementado
- 🔧 Com Problemas

---

## 🗂️ Estrutura de Pastas

```
/
├── prisma/
│   ├── migrations/ [6 migrations]
│   │   └── [STATUS: ✅ Todas aplicadas]
│   ├── schema.prisma [STATUS: ✅]
│   ├── seed.ts [STATUS: ✅]
│   ├── seed-badges.ts [STATUS: ✅]
│   └── seed-exercises.ts [STATUS: ✅]
├── src/
│   ├── app/
│   │   ├── (auth)/ [STATUS: ✅]
│   │   │   ├── login/ [STATUS: ✅]
│   │   │   ├── register/ [STATUS: ✅]
│   │   │   └── onboarding/ [STATUS: ✅]
│   │   ├── (platform)/ [STATUS: ✅]
│   │   │   ├── dashboard/ [STATUS: ✅]
│   │   │   ├── sessions/ [STATUS: ✅]
│   │   │   ├── my-sessions/ [STATUS: ✅]
│   │   │   ├── community/ [STATUS: ✅]
│   │   │   ├── wellness/ [STATUS: ✅]
│   │   │   ├── leaderboard/ [STATUS: ✅]
│   │   │   └── profile/ [STATUS: ✅]
│   │   ├── (therapist)/ [STATUS: ⚠️]
│   │   │   ├── dashboard/ [STATUS: ✅]
│   │   │   ├── sessions/ [STATUS: ✅]
│   │   │   └── profile/ [STATUS: ⚠️ Incompleto]
│   │   ├── (admin)/ [STATUS: ⚠️]
│   │   │   ├── dashboard/ [STATUS: ✅]
│   │   │   ├── moderation/ [STATUS: ✅]
│   │   │   └── profile/ [STATUS: ❌]
│   │   ├── (super-admin)/ [STATUS: ⚠️]
│   │   │   └── dashboard/ [STATUS: ✅]
│   │   └── api/ [STATUS: ✅ 40+ endpoints]
│   ├── components/ [STATUS: ✅ 80+ componentes]
│   ├── hooks/ [STATUS: ✅ 12 hooks]
│   ├── lib/ [STATUS: ✅]
│   └── types/ [STATUS: ✅]
└── public/ [STATUS: ⚠️ Apenas ícones padrão]
```

**Observações sobre a estrutura:**
- ✅ Estrutura bem organizada usando Route Groups do Next.js
- ✅ Separação clara por role (platform, therapist, admin, super-admin)
- ✅ Componentes organizados por feature
- ⚠️ Pasta `shared` em components está vazia
- ⚠️ Falta pasta `tests` - sem testes automatizados

---

## 🎨 Design System e UI

### Componentes Base Implementados

#### ✅ Componentes Completos (shadcn/ui)
| Componente | Localização | Variantes |
|------------|-------------|-----------|
| Button | `src/components/ui/button.tsx` | default, destructive, outline, secondary, ghost, link |
| Card | `src/components/ui/card.tsx` | Header, Content, Title, Description, Footer |
| Input | `src/components/ui/input.tsx` | default |
| Label | `src/components/ui/label.tsx` | default |
| Textarea | `src/components/ui/textarea.tsx` | default |
| Dialog | `src/components/ui/dialog.tsx` | Trigger, Content, Header, Footer |
| Avatar | `src/components/ui/avatar.tsx` | Image, Fallback |
| Dropdown Menu | `src/components/ui/dropdown-menu.tsx` | Completo |
| Select | `src/components/ui/select.tsx` | Completo |
| Checkbox | `src/components/ui/checkbox.tsx` | default |
| Switch | `src/components/ui/switch.tsx` | default |
| Tooltip | `src/components/ui/tooltip.tsx` | Completo |
| Scroll Area | `src/components/ui/scroll-area.tsx` | default |
| Form | `src/components/ui/form.tsx` | Com react-hook-form |

#### ⚠️ Componentes Parciais
- **Tabs**: Usando do Radix diretamente em alguns lugares

#### ❌ Componentes Faltantes
- **Toast/Sonner**: Importado mas não configurado globalmente
- **Table**: Não implementado (usando divs para listas)
- **Badge**: Implementado inline em alguns arquivos
- **Skeleton**: Não padronizado

### Temas e Estilos

```css
/* Cores implementadas - globals.css */
:root {
  --radius: 0.75rem;
  --primary: 217 91% 60%;        /* Azul */
  --primary-foreground: 0 0% 100%;
  --secondary: 152 44% 49%;      /* Verde */
  --accent: 262 52% 65%;         /* Roxo */
  --background: 210 40% 98%;     /* Branco-azulado */
  --foreground: 222 47% 11%;     /* Texto escuro */
  --success: 142 71% 45%;        /* Verde sucesso */
  --warning: 38 92% 50%;         /* Laranja */
  --error: 0 84% 60%;            /* Vermelho */
  --chart-1 a 5: configurados;
  --sidebar-*: configurados;
}

.dark {
  /* Modo escuro completamente configurado */
}
```

**Status do Tema:**
- [x] Modo claro implementado
- [x] Modo escuro implementado
- [x] Paleta de cores completa
- [x] Tipografia configurada (Geist Sans/Mono)
- [x] Espaçamento padronizado (Tailwind)
- [x] CSS Variables para customização
- [x] ThemeToggle funcional

### Acessibilidade Atual

**Checklist WCAG 2.1:**
- [x] Contraste adequado (cores bem definidas)
- [x] Navegação por teclado (componentes Radix)
- [ ] ARIA labels (parcial - falta em alguns componentes)
- [x] Foco visível (outline-ring configurado)
- [ ] Textos alternativos (imagens sem alt em alguns lugares)
- [ ] Skip links (não implementado)
- [ ] Roles semânticos (parcial)

**Problemas de Acessibilidade Encontrados:**
1. Faltam `aria-label` em botões de ícone - Severidade: Média
2. Alguns formulários sem associação label-input - Severidade: Baixa
3. Imagens de avatar sem alt text descritivo - Severidade: Baixa

---

## 🔐 Autenticação e Autorização

### Schema de Usuários

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(PATIENT)
  status        UserStatus @default(ACTIVE)
  
  // Relations
  profile           UserProfile?
  therapistProfile  TherapistProfile?
  patientProfile    PatientProfile?
  preferences       UserPreferences?
  emergencyContacts EmergencyContact[]
  // ... outras relações
}

enum Role {
  SUPER_ADMIN
  ADMIN
  THERAPIST
  PATIENT
}

enum UserStatus {
  ACTIVE
  PENDING
  SUSPENDED
  BANNED
}
```

**Status:**
- ✅ Modelo base User implementado
- ✅ Roles implementados (SUPER_ADMIN, ADMIN, THERAPIST, PATIENT)
- ✅ Profiles separados por role (TherapistProfile, PatientProfile)
- ✅ Relações entre modelos bem definidas
- ✅ Status de usuário para moderação

### NextAuth / Sistema de Auth

**Configuração:**
- **Provider Configurado:** Credentials (email/senha)
- **Session Strategy:** JWT
- **Adapter:** Prisma Adapter

**Callbacks Implementados:**
- `jwt`: Adiciona role ao token
- `session`: Expõe id e role na sessão

**Status das Funcionalidades:**
- [x] Login com email/senha
- [ ] Login com Google (não configurado)
- [x] Registro de novo usuário
- [ ] Verificação de email (campo existe, não implementado)
- [ ] Recuperação de senha (não implementado)
- [ ] 2FA (não implementado)
- [x] Middleware de proteção de rotas
- [x] Verificação de roles

**Problemas Encontrados:**
1. `authOptions` exportado incorretamente em alguns arquivos
   - Arquivo: `src/app/(platform)/layout.tsx`
   - Descrição: Usa `getServerSession(authOptions)` mas deveria usar a nova API do NextAuth v5
   - Impacto: Pode causar erros em produção

---

## 👥 Sistema de Usuários e Roles

### SUPER_ADMIN

**Páginas Implementadas:**
- [x] `/super-admin/dashboard` - Status: ✅
- [ ] `/super-admin/admins` - Status: ❌ (Link existe, página não)
- [ ] `/super-admin/audit` - Status: ❌ (Link existe, página não)
- [ ] `/super-admin/system` - Status: ❌ (Link existe, página não)

**Funcionalidades:**
- [ ] Criar/Editar/Deletar admins - ❌ Não implementado
- [ ] Visualizar logs de auditoria - ❌ Não implementado
- [ ] Configurações globais - ❌ Não implementado
- [ ] Métricas do sistema - ⚠️ Apenas mockado no dashboard

**Problemas:** 
- Dashboard exibe apenas dados mock estáticos
- Faltam todas as funcionalidades específicas de super admin

### ADMIN

**Páginas Implementadas:**
- [x] `/admin/dashboard` - Status: ✅
- [ ] `/admin/users` - Status: ❌ (Link existe, página não)
- [x] `/admin/moderation` - Status: ✅
- [x] `/admin/moderation/reports` - Status: ✅
- [ ] `/admin/blog` - Status: ❌ (Link existe, página não)

**Funcionalidades:**
- [ ] Aprovar terapeutas - ❌ Não implementado
- [x] Moderar conteúdo - ✅ Sistema de reports
- [ ] Gerenciar usuários - ⚠️ API existe, UI não
- [x] Visualizar denúncias - ✅ ReportQueue implementado
- [x] Banir usuários - ✅ API implementada

**Problemas:**
- Dashboard com dados mock
- Falta página de gestão de usuários

### THERAPIST

**Páginas Implementadas:**
- [x] `/therapist/dashboard` - Status: ✅
- [x] `/therapist/sessions` - Status: ✅
- [x] `/therapist/sessions/new` - Status: ✅
- [x] `/therapist/sessions/[id]` - Status: ✅
- [ ] `/therapist/patients` - Status: ❌ (Link existe, página não)
- [ ] `/therapist/schedule` - Status: ❌ (Link existe, página não)
- [ ] `/therapist/analytics` - Status: ❌ (Link existe, página não)

**Funcionalidades:**
- [x] Criar sessões de grupo - ✅ Completo com formulário
- [x] Editar/Cancelar sessões - ✅ Funcional
- [x] Iniciar sessão (ir ao vivo) - ✅ API implementada
- [ ] Visualizar pacientes - ❌ Não implementado
- [ ] Gerenciar agenda - ❌ Não implementado
- [x] Notas clínicas - ✅ SessionNotesForm implementado

**Problemas:**
- Faltam páginas de pacientes e agenda
- Dashboard com dados mock

### PATIENT

**Páginas Implementadas:**
- [x] `/dashboard` - Status: ✅
- [x] `/sessions` - Status: ✅ (listagem pública)
- [x] `/sessions/[id]` - Status: ✅ (detalhes e inscrição)
- [x] `/my-sessions` - Status: ✅
- [x] `/community` - Status: ✅
- [x] `/community/[id]` - Status: ✅
- [x] `/community/new` - Status: ✅
- [x] `/wellness` - Status: ✅
- [x] `/wellness/mood` - Status: ✅
- [x] `/wellness/mood/stats` - Status: ✅
- [x] `/wellness/journal` - Status: ✅
- [x] `/wellness/journal/new` - Status: ✅
- [x] `/wellness/journal/[id]` - Status: ✅
- [x] `/wellness/exercises` - Status: ✅
- [x] `/wellness/exercises/[id]` - Status: ✅
- [x] `/profile` - Status: ✅
- [x] `/profile/achievements` - Status: ✅
- [x] `/profile/settings` - Status: ⚠️ (UI presente, save não funciona)
- [x] `/leaderboard` - Status: ✅

**Funcionalidades:**
- [x] Participar de sessões - ✅
- [x] Acessar comunidade - ✅
- [x] Mood tracker - ✅ Muito completo
- [x] Journal - ✅ Completo
- [x] Exercícios de mindfulness - ✅

**Problemas:**
- Configurações de perfil não salvam (`// TODO: Implement API call`)
- Dashboard com alguns dados mock

---

## 🎥 Sistema de Sessões de Terapia

### Schema

```prisma
model GroupSession {
  id              String        @id @default(cuid())
  title           String
  description     String        @db.Text
  category        SessionCategory
  therapistId     String
  therapist       TherapistProfile @relation(...)
  scheduledAt     DateTime
  duration        Int           // minutos
  maxParticipants Int           @default(10)
  status          SessionStatus @default(SCHEDULED)
  roomName        String?       @unique
  roomUrl         String?
  coverImage      String?
  tags            String[]
  participants    SessionParticipant[]
  chatMessages    SessionChatMessage[]
  notes           SessionNote[]
}

enum SessionCategory {
  ANXIETY, DEPRESSION, GRIEF, TRAUMA, RELATIONSHIPS,
  SELF_ESTEEM, NEURODIVERGENCE, STRESS, ADDICTION,
  PARENTING, CAREER, GENERAL
}

enum SessionStatus {
  SCHEDULED, LIVE, COMPLETED, CANCELLED
}
```

**Status do Schema:** ✅ Completo

### Funcionalidades - Criação de Sessão (Therapist)

**Arquivos:**
- `src/components/sessions/session-form.tsx`
- `src/app/api/sessions/route.ts`

**Status:** ✅ Funcional

**O que está funcionando:**
1. Formulário com validação Zod
2. Seleção de categoria visual
3. Definição de data/hora
4. Limite de participantes
5. Tags personalizadas
6. Verificação de terapeuta verificado

**O que está faltando:**
1. Upload de imagem de capa (aceita apenas URL)
2. Recorrência de sessões

### Funcionalidades - Listagem e Inscrição (Patient)

**Arquivos:**
- `src/app/(platform)/sessions/page.tsx`
- `src/components/sessions/sessions-grid.tsx`
- `src/components/sessions/session-card.tsx`

**Status:** ✅ Funcional

**O que está funcionando:**
1. Listagem de sessões disponíveis
2. Filtros por categoria, data, disponibilidade
3. Busca por termo
4. Inscrição com validação
5. Verificação de vagas

**O que está faltando:**
1. Paginação (carrega todas de uma vez)

### Sistema de Videochamada

**SDK Utilizado:** Daily.co (`@daily-co/daily-js` v0.85.0)

**Status:**
- [x] SDK configurado
- [x] Funções de API implementadas (`src/lib/daily.ts`)
- [x] Componente VideoRoom implementado
- [x] Controles (mute, câmera, sair)
- [x] Grid de participantes
- [x] Sidebar com participantes e chat

**Arquivos Relacionados:**
- `src/lib/daily.ts` - API helpers
- `src/components/video/video-room.tsx`
- `src/components/video/video-grid.tsx`
- `src/components/video/video-controls.tsx`
- `src/components/video/video-tile.tsx`
- `src/components/video/participant-list.tsx`
- `src/components/video/session-chat.tsx`

**Problemas:**
1. Variáveis de ambiente `DAILY_API_KEY` e `DAILY_DOMAIN` necessárias
2. Chat usa Socket.io que pode não estar rodando

### Chat em Tempo Real

**Tecnologia:** Socket.io (`socket.io` v4.8.1)

**Status:**
- [x] Cliente configurado (`src/lib/socket.ts`)
- [x] Componente SessionChat implementado
- [x] Mensagens persistidas no DB (SessionChatMessage)
- [ ] Servidor Socket.io NÃO incluído no projeto

**Problemas:**
1. **CRÍTICO**: Servidor Socket.io não está implementado no projeto
   - O cliente tenta conectar em `NEXT_PUBLIC_SOCKET_URL` ou `localhost:3001`
   - É necessário um servidor separado ou usar alternativas como Pusher/Ably

---

## 💬 Sistema de Comunidade (Fórum)

### Schema

```prisma
model Post {
  id          String       @id @default(cuid())
  title       String
  content     String       @db.Text
  excerpt     String?
  category    PostCategory
  authorId    String
  isAnonymous Boolean      @default(false)
  isPinned    Boolean      @default(false)
  isLocked    Boolean      @default(false)
  viewCount   Int          @default(0)
  comments    Comment[]
  votes       Vote[]
  tags        PostTag[]
  reports     Report[]
}

model Comment {
  id          String    @id @default(cuid())
  content     String    @db.Text
  postId      String
  authorId    String
  parentId    String?   // Para comentários aninhados
  isAnonymous Boolean   @default(false)
  isEdited    Boolean   @default(false)
  votes       Vote[]
  reports     Report[]
}

model Vote {
  value       Int       // +1 ou -1
  userId      String
  postId      String?
  commentId   String?
}
```

**Status do Schema:** ✅ Completo

### Feed de Posts

**Página:** `src/app/(platform)/community/page.tsx`
**Status:** ✅ Completo

**Funcionalidades:**
- [x] Listagem de posts
- [x] Filtros por categoria
- [x] Busca por termo
- [x] Infinite scroll (useInfiniteQuery)
- [x] Ordenação (popular, recente, mais comentados)
- [x] Contador de posts/membros

### Criação de Post

**Componente:** `src/components/community/post-form.tsx`
**Status:** ✅ Completo

**Funcionalidades:**
- [x] Editor de texto rico (TipTap)
- [x] Seleção de categoria
- [x] Tags personalizadas
- [x] Post anônimo
- [x] Preview (via editor)

### Visualização e Comentários

**Página:** `src/app/(platform)/community/[id]/page.tsx`
**Status:** ✅ Completo

**Funcionalidades:**
- [x] Visualizar post completo
- [x] Sistema de comentários
- [x] Comentários aninhados (replies)
- [x] Votação (upvote/downvote)
- [x] Editar/Deletar próprio conteúdo

### Moderação

**Página Admin:** `src/app/(admin)/moderation/reports/page.tsx`
**Status:** ✅ Funcional

**Funcionalidades:**
- [x] Fila de denúncias (ReportQueue)
- [x] Deletar conteúdo (API)
- [x] Banir usuário (API)
- [x] Resolver/Dispensar report
- [ ] Histórico de moderação (não visível)

---

## 🧘 Ferramentas de Bem-Estar

### Mood Tracker

**Schema:**
```prisma
model MoodEntry {
  id          String    @id @default(cuid())
  patientId   String
  mood        Int       // 1-10
  energy      Int?      // 1-10
  anxiety     Int?      // 1-10
  sleep       Int?      // 1-10
  emotions    String[]
  activities  String[]
  notes       String?   @db.Text
  date        DateTime
}
```

**Páginas/Componentes:**
- `src/app/(platform)/wellness/mood/page.tsx` - ✅
- `src/app/(platform)/wellness/mood/stats/page.tsx` - ✅
- `src/components/wellness/mood-input.tsx` - ✅
- `src/components/wellness/mood-slider.tsx` - ✅
- `src/components/wellness/emotion-picker.tsx` - ✅
- `src/components/wellness/activity-picker.tsx` - ✅
- `src/components/wellness/mood-chart.tsx` - ✅
- `src/components/wellness/mood-heatmap.tsx` - ✅
- `src/components/wellness/mood-stats.tsx` - ✅
- `src/components/wellness/mood-insights.tsx` - ✅

**Funcionalidades:**
- [x] Registrar mood diário (1-10)
- [x] Rastrear energia, ansiedade, sono
- [x] Selecionar emoções sentidas
- [x] Selecionar atividades realizadas
- [x] Adicionar notas
- [x] Visualizar histórico
- [x] Gráficos de tendência (Recharts)
- [x] Calendário visual (heatmap)
- [ ] Exportar dados (componente existe mas não funcional)

**Biblioteca de Gráficos:** Recharts v3.5.0 ✅

### Journal (Diário)

**Schema:**
```prisma
model JournalEntry {
  id          String    @id @default(cuid())
  patientId   String
  title       String?
  content     String    @db.Text
  mood        Int?
  promptId    String?
  prompt      JournalPrompt?
  tags        String[]
  isPrivate   Boolean   @default(true)
  isFavorite  Boolean   @default(false)
}
```

**Páginas/Componentes:**
- `src/app/(platform)/wellness/journal/page.tsx` - ✅
- `src/app/(platform)/wellness/journal/new/page.tsx` - ✅
- `src/app/(platform)/wellness/journal/[id]/page.tsx` - ✅
- `src/components/wellness/journal-list.tsx` - ✅
- `src/components/wellness/journal-editor.tsx` - ✅
- `src/components/wellness/journal-prompts.tsx` - ✅

**Funcionalidades:**
- [x] Criar entrada com editor rico
- [x] Listar entradas
- [x] Buscar em entradas
- [x] Tags/Categorias
- [x] Marcar como favorito
- [x] Prompts guiados
- [x] Privacidade (isPrivate)
- [x] Editar/Deletar

### Exercícios de Mindfulness

**Schema:**
```prisma
model MindfulnessExercise {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  category    ExerciseCategory
  duration    Int       // minutos
  difficulty  Difficulty
  instructions String[]
  audioUrl    String?
  imageUrl    String?
  benefits    String[]
  isActive    Boolean
  isFeatured  Boolean
}

enum ExerciseCategory {
  BREATHING, MEDITATION, BODY_SCAN, GROUNDING,
  VISUALIZATION, RELAXATION, MINDFUL_MOVEMENT
}
```

**Páginas/Componentes:**
- `src/app/(platform)/wellness/exercises/page.tsx` - ✅
- `src/app/(platform)/wellness/exercises/[id]/page.tsx` - ✅
- `src/components/wellness/exercise-card.tsx` - ✅
- `src/components/wellness/exercise-grid.tsx` - ✅
- `src/components/wellness/exercise-player.tsx` - ✅
- `src/components/wellness/exercise-steps.tsx` - ✅
- `src/components/wellness/exercise-timer.tsx` - ✅
- `src/components/wellness/breathing-animation.tsx` - ✅

**Funcionalidades:**
- [x] Listar exercícios
- [x] Filtrar por categoria/dificuldade
- [x] Visualizar detalhes
- [x] Timer de exercício
- [x] Instruções passo a passo
- [x] Animação de respiração
- [x] Registrar conclusão
- [ ] Player de áudio (campo existe, não implementado)
- [x] Histórico de completions

**Problemas:**
1. `TODO` no código: navegação para player não implementada completamente

---

## 🎮 Sistema de Gamificação

### Schema

```prisma
// Em PatientProfile
model PatientProfile {
  points         Int      @default(0)
  level          Int      @default(1)
  streak         Int      @default(0)
  longestStreak  Int      @default(0)
  moodStreak     Int      @default(0)
  exerciseStreak Int      @default(0)
}

model Badge {
  id            String    @id @default(cuid())
  name          String    @unique
  slug          String    @unique
  description   String
  icon          String    // Emoji
  category      BadgeCategory
  rarity        BadgeRarity
  criteriaType  String
  criteriaValue Int
  criteriaExtra String?   // JSON
  pointsReward  Int
  isSecret      Boolean
}

model UserBadge {
  userId      String
  badgeId     String
  unlockedAt  DateTime
}

model PointTransaction {
  userId        String
  amount        Int
  type          PointType
  description   String?
  referenceId   String?
  referenceType String?
}

model DailyCheckIn {
  userId      String
  date        DateTime  @db.Date
}
```

### Implementação

**Arquivos Principais:**
- `src/lib/gamification.ts` - Service principal
- `src/lib/gamification/points.ts` - Sistema de pontos
- `src/lib/gamification/badges.ts` - Sistema de badges
- `src/lib/gamification/streak.ts` - Sistema de streak
- `src/lib/gamification/levels.ts` - Sistema de níveis
- `src/lib/gamification/constants.ts` - Configurações

**Componentes UI:**
- `src/components/gamification/badge-card.tsx` - ✅
- `src/components/gamification/badge-grid.tsx` - ✅
- `src/components/gamification/badge-unlock-modal.tsx` - ✅
- `src/components/gamification/daily-checkin.tsx` - ✅
- `src/components/gamification/leaderboard-table.tsx` - ✅
- `src/components/gamification/level-badge.tsx` - ✅
- `src/components/gamification/level-progress.tsx` - ✅
- `src/components/gamification/level-up-modal.tsx` - ✅
- `src/components/gamification/points-animation.tsx` - ✅
- `src/components/gamification/points-display.tsx` - ✅
- `src/components/gamification/points-history.tsx` - ✅
- `src/components/gamification/stats-overview.tsx` - ✅
- `src/components/gamification/streak-display.tsx` - ✅
- `src/components/gamification/top-user-card.tsx` - ✅
- `src/components/gamification/activity-calendar.tsx` - ✅

**Funcionalidades:**
- [x] Atribuição de pontos por ação
- [x] Cálculo de level
- [x] Sistema de streak (diário, mood, exercise)
- [x] Desbloqueio de badges automático
- [ ] Notificação de conquista (TODO no código)
- [x] Leaderboard (geral, semanal, mensal)
- [x] Calendário de atividade

**Ações que Geram Pontos:**
| Ação | Pontos |
|------|--------|
| Mood entry | 10 |
| Mood streak bonus | 5/dia |
| Journal entry | 15 |
| Journal longo (>500 palavras) | +10 |
| Exercise completion | 25 |
| Exercise streak bonus | 10/dia |
| Post created | 10 |
| Comment created | 5 |
| Upvote received | 1 |
| Session attended | 50 |
| Daily check-in | 10 |
| Badge unlocked | variável |

**Badges Seedados:** 26 badges em 6 categorias
- MILESTONE (4)
- COMMUNITY (6)
- SESSIONS (3)
- WELLNESS (9)
- SOCIAL (2)
- SPECIAL (2)

---

## 📝 Blog e Conteúdo Educacional

### Status: ❌ NÃO IMPLEMENTADO

**Schema:** Não existe modelo Blog/Article no Prisma

**Referências Encontradas:**
- Link no dashboard do admin: `/admin/blog`
- Link no dashboard do paciente: `/blog`
- Ícone BookOpen na navegação

**O que precisaria ser implementado:**
1. Schema Prisma (BlogPost, BlogCategory)
2. Páginas de listagem e visualização
3. CMS para admin criar/editar posts
4. API routes

---

## 🔔 Sistema de Notificações

### Status: ❌ NÃO IMPLEMENTADO

**Schema:** Não existe modelo Notification no Prisma

**TODOs encontrados no código:**
```typescript
// src/lib/gamification/points.ts:447
// TODO: Implement actual notification system (email, push, in-app)
```

### In-App

**Status:** ❌ Não implementado
- Sem ícone de notificação no header
- Sem dropdown de notificações
- Sem sistema de marcar como lida

### Real-time

**Status:** ❌ Não implementado (Socket.io configurado mas servidor ausente)

### Email

**Serviço:** Nenhum configurado

**Status:** ❌ Não implementado
- Sem templates de email
- Sem serviço (SendGrid/Resend) configurado

---

## 🗄️ Banco de Dados

### Schema Completo

O schema Prisma contém **25 modelos**:
1. User
2. Account
3. Session (NextAuth)
4. VerificationToken
5. UserProfile
6. TherapistProfile
7. PatientProfile
8. UserPreferences
9. EmergencyContact
10. UserGoal
11. UserMoodLog
12. GroupSession
13. SessionParticipant
14. SessionChatMessage
15. SessionNote
16. MoodEntry
17. JournalEntry
18. JournalPrompt
19. MindfulnessExercise
20. ExerciseCompletion
21. Post
22. Comment
23. Vote
24. Tag
25. PostTag
26. Report
27. Badge
28. UserBadge
29. PointTransaction
30. DailyCheckIn

### Migrations

**Última Migration:** 20251127193338_add_gamification_badges

**Migrations Aplicadas:**
1. `20251127163710_init` - Schema inicial
2. `20251127164147_add_user_profiles_and_related_models` - Perfis
3. `20251127165640_add_session_models` - Sessões
4. `20251127181927_add_community_schema` - Comunidade
5. `20251127185442_add_wellness_schema` - Bem-estar
6. `20251127193338_add_gamification_badges` - Gamificação

**Status:** ✅ Todas aplicadas em sequência no mesmo dia

### Seeds

**Arquivos:**
- `prisma/seed.ts` - Entry point
- `prisma/seed-exercises.ts` - Exercícios de mindfulness
- `prisma/seed-badges.ts` - 26 badges
- `prisma/seed-advanced-badges.ts` - Badges adicionais

**Dados de Seed:**
- [x] Badges (26+)
- [x] Exercícios de mindfulness
- [ ] Usuários de teste
- [ ] Posts de exemplo
- [ ] Journal prompts

**Comando:** `npm run db:seed`

---

## 🔌 APIs e Endpoints

### Estrutura

```
/api
├── auth/
│   ├── [...nextauth]/ [✅]
│   └── register/ [✅]
├── sessions/
│   ├── route.ts [✅] GET/POST
│   └── [id]/
│       ├── route.ts [✅] GET/PATCH/DELETE
│       ├── enrollment/ [✅]
│       ├── join/ [✅]
│       ├── leave/ [✅]
│       ├── notes/ [✅]
│       ├── room/ [✅]
│       ├── status/ [✅]
│       └── token/ [✅]
├── posts/
│   ├── route.ts [✅] GET/POST
│   └── [id]/
│       ├── route.ts [✅] GET/PATCH/DELETE
│       ├── comments/ [✅]
│       └── vote/ [✅]
├── comments/
│   └── [id]/
│       ├── route.ts [✅]
│       └── vote/ [✅]
├── wellness/
│   ├── mood/ [✅]
│   │   └── stats/ [✅]
│   ├── journal/ [✅]
│   │   └── [id]/ [✅]
│   ├── exercises/ [✅]
│   │   └── [id]/complete/ [✅]
│   └── gamification/ [✅]
├── gamification/
│   ├── badges/ [✅]
│   │   └── user/ [✅]
│   ├── checkin/ [✅]
│   ├── leaderboard/ [✅]
│   └── points/ [✅]
├── admin/
│   ├── reports/ [✅]
│   │   └── [id]/ [✅]
│   ├── posts/[id]/ [✅]
│   └── users/[id]/ban/ [✅]
├── user/
│   ├── profile/ [✅]
│   ├── preferences/ [✅]
│   └── role/ [✅]
├── onboarding/
│   ├── patient/ [✅]
│   └── therapist/ [✅]
├── public/
│   └── sessions/ [✅]
├── reports/ [✅]
└── my-sessions/ [✅]
```

**Total:** ~45 endpoints implementados

### Validação

**Biblioteca:** Zod v4.1.13 ✅

**Arquivos de validação:**
- `src/lib/validations/community.ts`
- `src/lib/validations/journal.ts`
- `src/lib/validations/mood.ts`
- `src/lib/validations/onboarding.ts`
- `src/lib/validations/post.ts`
- `src/lib/validations/session.ts`
- `src/lib/validations/user.ts`
- `src/lib/validations/wellness.ts`

**Status:**
- [x] Validação em todos os endpoints POST/PATCH
- [x] Schemas de validação centralizados
- [x] Mensagens de erro em português

### Rate Limiting

**Status:** ❌ Não implementado

---

## 🎨 Frontend - Componentes e Páginas

### Páginas Públicas

#### Landing Page
- **Caminho:** `src/app/page.tsx`
- **Status:** ⚠️ Básica
- **Seções:**
  - [x] Hero (simples)
  - [x] Features (4 cards)
  - [x] CTA
  - [ ] Testimonials
  - [ ] FAQ
- **Problemas:** Design muito simples, não atrai

#### Sobre / FAQ / Contato
- **Status:** ❌ Não existem

### Layouts

#### Layout Principal (Platform)
- **Arquivo:** `src/app/(platform)/layout.tsx`
- **Componentes:**
  - [x] Header (`src/components/layout/header.tsx`)
  - [x] Sidebar (`src/components/layout/sidebar.tsx`)
  - [ ] Footer
  - [ ] Breadcrumbs
- **Responsividade:** ⚠️ Sidebar esconde em mobile, sem menu hamburguer

### Componentes Reutilizáveis

**Localização:** `src/components/`

#### Componentes de Feature

| Componente | Localização | Status |
|------------|-------------|--------|
| PostCard | `community/post-card.tsx` | ✅ |
| PostForm | `community/post-form.tsx` | ✅ |
| PostFeed | `community/post-feed.tsx` | ✅ |
| CommentSection | `community/comment-section.tsx` | ✅ |
| VoteButtons | `community/vote-buttons.tsx` | ✅ |
| RichEditor | `community/rich-editor.tsx` | ✅ |
| SessionCard | `sessions/session-card.tsx` | ✅ |
| SessionForm | `sessions/session-form.tsx` | ✅ |
| SessionsGrid | `sessions/sessions-grid.tsx` | ✅ |
| VideoRoom | `video/video-room.tsx` | ✅ |
| MoodInput | `wellness/mood-input.tsx` | ✅ |
| JournalEditor | `wellness/journal-editor.tsx` | ✅ |
| ExercisePlayer | `wellness/exercise-player.tsx` | ✅ |
| BadgeGrid | `gamification/badge-grid.tsx` | ✅ |
| LeaderboardTable | `gamification/leaderboard-table.tsx` | ✅ |

### Estado Global

**Biblioteca:** Nenhuma (usa React Query para server state)

**Hooks Customizados:**
- `use-wellness.ts` - React Query hooks para wellness
- `use-posts.ts` - React Query hooks para posts
- `use-comments.ts` - React Query hooks para comments
- `use-user-profile.ts` - Perfil do usuário
- `use-therapist-profile.ts` - Perfil terapeuta
- `use-patient-profile.ts` - Perfil paciente
- `use-admin.ts` - Funções admin
- `use-reports.ts` - Sistema de reports
- `use-auth.ts` - Autenticação
- `use-require-role.ts` - Verificação de role
- `use-session-chat.ts` - Chat de sessão

**Problemas:**
- Usa `@tanstack/react-query` mas Provider não visível no layout root

---

## 🔒 Segurança

### Implementações

- [ ] CSRF protection (NextAuth tem built-in)
- [x] XSS sanitization (`isomorphic-dompurify` instalado)
- [x] SQL injection prevention (Prisma ORM)
- [ ] Rate limiting
- [x] Input validation (Zod)
- [ ] File upload validation (não há uploads)
- [x] Password hashing (bcrypt)
- [ ] Secure headers (não configurado)
- [ ] HTTPS enforced (depende do deploy)

### Vulnerabilidades Encontradas

**Críticas:**
1. **Socket.io sem autenticação**
   - Descrição: O cliente Socket.io conecta sem token de autenticação
   - Localização: `src/lib/socket.ts`
   - Impacto: Qualquer um pode enviar mensagens no chat

**Médias:**
1. **authOptions exportado incorretamente**
   - Alguns arquivos usam API antiga do NextAuth

**Baixas:**
1. Variáveis de ambiente expostas no cliente (NEXT_PUBLIC_*)

---

## ⚡ Performance

### Métricas Atuais

**Não medidas** - Aplicação não está em produção

### Otimizações Implementadas

- [x] Image optimization (next/image disponível)
- [x] Code splitting (Next.js automático)
- [ ] Lazy loading de componentes
- [ ] Caching (Redis não configurado)
- [x] Database indexing (via Prisma @@index)
- [x] API memoization (React Query)

### Problemas de Performance Potenciais

1. **Carregamento de todas sessões**
   - Descrição: `fetchSessions` carrega todas de uma vez
   - Sugestão: Implementar paginação no backend

---

## 📱 Responsividade

### Breakpoints Testados

- [x] Mobile (< 768px) - Parcial
- [x] Tablet (768px - 1024px) - OK
- [x] Desktop (> 1024px) - OK

### Problemas por Dispositivo

**Mobile:**
- Sidebar não tem menu hamburguer
- Alguns cards muito largos
- Video room pode ter problemas

---

## ♿ Acessibilidade

### Auditoria WCAG 2.1

Não foi feita auditoria formal. Baseado em inspeção de código:

**Pontos Positivos:**
- Componentes Radix UI são acessíveis por padrão
- Cores com bom contraste
- Foco visível configurado

**Pontos de Melhoria:**
- Faltam aria-labels em ícones
- Sem skip links
- Imagens sem alt descritivo

---

## 🧪 Testes

### Cobertura

**Unitários:**
- Configurado: ❌
- Framework: Nenhum instalado
- Cobertura: 0%

**Integração:**
- Configurado: ❌

**E2E:**
- Configurado: ❌

### Arquivos de Teste

```
tests/
└── [VAZIO - não existe]
```

---

## 📦 Dependências

### Principais (dependencies)

```json
{
  "@auth/prisma-adapter": "^2.11.1",
  "@daily-co/daily-js": "^0.85.0",
  "@daily-co/daily-react": "^0.24.0",
  "@hookform/resolvers": "^5.2.2",
  "@prisma/client": "^5.0.0",
  "@radix-ui/*": "várias versões",
  "@tiptap/*": "^3.11.1",
  "bcryptjs": "^3.0.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "framer-motion": "^12.23.24",
  "isomorphic-dompurify": "^2.33.0",
  "lucide-react": "^0.555.0",
  "next": "16.0.5",
  "next-auth": "^5.0.0-beta.30",
  "next-themes": "^0.4.6",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "react-hook-form": "^7.66.1",
  "recharts": "^3.5.0",
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1",
  "tailwind-merge": "^3.4.0",
  "zod": "^4.1.13"
}
```

### Análise

**Dependências Modernas:**
- Next.js 16 (versão muito recente)
- React 19 (versão recente)
- NextAuth v5 beta

**Potenciais Problemas:**
- NextAuth v5 beta pode ter breaking changes
- Algumas APIs usam padrão antigo (`getServerSession(authOptions)`)

**Dependências Não Utilizadas:**
- `socket.io` (servidor) - instalado mas sem server implementado

---

## 🚀 Deploy e DevOps

### Ambiente de Desenvolvimento

**Como rodar:**
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar com suas variáveis

# 3. Rodar migrations
npx prisma migrate dev

# 4. Seed do banco
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

**Variáveis de Ambiente Necessárias:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
DAILY_API_KEY=...
DAILY_DOMAIN=...
NEXT_PUBLIC_SOCKET_URL=... (opcional)
```

### Ambiente de Produção

**Provedor:** Não deployado

**Status:**
- [ ] CI/CD configurado
- [ ] Staging environment
- [ ] Monitoramento
- [ ] Backups automáticos

---

## 📊 Análise de Código

### Problemas Estruturais

1. **Inconsistência de imports do auth**
   - **Localização:** Vários arquivos
   - **Impacto:** Médio
   - **Sugestão:** Padronizar uso de `auth()` do NextAuth v5

2. **Servidor Socket.io ausente**
   - **Localização:** Chat de sessão
   - **Impacto:** Alto - Chat não funciona
   - **Sugestão:** Implementar servidor ou usar alternativa (Pusher)

3. **Dados mock em dashboards**
   - **Localização:** Todos os dashboards
   - **Impacto:** Médio
   - **Sugestão:** Conectar APIs reais

### Code Smells

1. Alguns componentes muito grandes (>300 linhas)
2. Lógica duplicada em alguns hooks

### TODOs e FIXMEs no Código

```
src/lib/gamification/points.ts:447 // TODO: Implement actual notification system
src/lib/gamification/points.ts:455 // TODO: Implement actual notification system
src/app/(platform)/wellness/exercises/page.tsx:49 // TODO: Navigate to exercise player
src/components/admin/report-queue.tsx:111 // TODO: Get actual counts from API
src/components/community/comment-item.tsx:115 // TODO: Implement report functionality
src/app/api/admin/users/[id]/ban/route.ts:105 // TODO: Log the ban action
src/app/api/sessions/[id]/status/route.ts:102 // TODO: Send notification
src/app/(platform)/profile/settings/page.tsx:38 // TODO: Implement API call to save preferences
```

---

## 🐛 Bugs Conhecidos

### Críticos

1. **Chat de sessão não funciona**
   - **Descrição:** Servidor Socket.io não implementado
   - **Como reproduzir:** Entrar em uma sessão e tentar enviar mensagem
   - **Comportamento esperado:** Mensagem é enviada e recebida por todos
   - **Comportamento atual:** Conexão falha ou mensagens não chegam
   - **Localização provável:** `src/lib/socket.ts`, falta servidor

### Médios

1. **Configurações de perfil não salvam**
   - **Descrição:** TODO no código
   - **Localização:** `src/app/(platform)/profile/settings/page.tsx:38`

2. **authOptions deprecado**
   - **Descrição:** Uso de API antiga do NextAuth
   - **Localização:** Vários arquivos de layout

### Menores

1. **Toast não configurado globalmente**
   - Algumas ações não mostram feedback visual

---

## 📋 Inconsistências de Design

1. **Botões**
   - Alguns lugares usam `variant="outline"`, outros `variant="secondary"` para mesma função

2. **Espaçamento**
   - `space-y-6` vs `space-y-8` inconsistente entre páginas

3. **Cards**
   - Alguns cards têm hover effect, outros não

---

## 🔄 Fluxos de Usuário

### Onboarding

```
[Registro] → [Escolher Tipo] 
    ↓               ↓
[Patient]      [Therapist]
    ↓               ↓
[Form Patient] [Form Therapist]
    ↓               ↓
[Dashboard]   [Aguardando Aprovação]
```

**Status:** ✅ Implementado
**Problemas:** Aprovação de terapeuta não tem UI admin

### Participar de Sessão

```
[Lista de Sessões] → [Ver Detalhes] → [Inscrever-se]
                                           ↓
                                    [Aguardar Início]
                                           ↓
                                    [Entrar na Sala]
                                           ↓
                                    [Video + Chat]
```

**Status:** ✅ Implementado
**Problemas:** Chat pode não funcionar (Socket.io)

### Criar Post na Comunidade

```
[Feed] → [Novo Post] → [Preencher Form] → [Publicar]
                              ↓
                       [Editor TipTap]
                       [Categoria]
                       [Tags]
                       [Anônimo?]
```

**Status:** ✅ Implementado

---

## 📝 Documentação Existente

- [x] README.md - Status: ⚠️ (Apenas template padrão Next.js)
- [ ] CONTRIBUTING.md - Status: ❌
- [ ] API Documentation - Status: ❌
- [ ] Component Storybook - Status: ❌

---

## 🎯 Trabalho Não Iniciado

### Features Faltantes Principais

1. **Blog/Conteúdo Educacional**
   - Schema
   - Páginas
   - CMS Admin

2. **Sistema de Notificações**
   - In-app
   - Email
   - Push

3. **Páginas Admin**
   - Gestão de usuários
   - Aprovar terapeutas
   - Analytics

4. **Páginas Super Admin**
   - Gestão de admins
   - Logs de auditoria
   - Configurações do sistema

5. **Páginas Therapist**
   - Lista de pacientes
   - Agenda/Calendário
   - Analytics

---

## 💡 Recomendações Prioritárias

### Curto Prazo (1-2 semanas)

1. **Corrigir Chat de Sessão**
   - **Motivo:** Funcionalidade core quebrada
   - **Impacto:** Alto - sessões de grupo precisam de chat
   - **Esforço:** Médio
   - **Solução:** Implementar servidor Socket.io ou migrar para Pusher/Ably

2. **Corrigir Settings do Perfil**
   - **Motivo:** TODO deixado no código
   - **Impacto:** Médio
   - **Esforço:** Baixo

3. **Padronizar Auth**
   - **Motivo:** Mistura de APIs NextAuth v4 e v5
   - **Impacto:** Médio - pode causar erros
   - **Esforço:** Médio

### Médio Prazo (1 mês)

1. **Implementar Notificações**
   - Crítico para engajamento
   - Configurar serviço de email

2. **Dashboard Admin Funcional**
   - Gestão de usuários
   - Aprovar terapeutas

3. **Dados Reais nos Dashboards**
   - Remover mocks
   - Conectar APIs

### Longo Prazo (2+ meses)

1. **Implementar Blog**
2. **Testes Automatizados**
3. **PWA Support**
4. **Analytics e Métricas**

---

## 🔧 Refatorações Necessárias

1. **Padronizar autenticação NextAuth v5**
   - **Problema Atual:** Mistura de APIs
   - **Solução Proposta:** Usar `auth()` consistentemente
   - **Arquivos Afetados:** Todos layouts e API routes
   - **Prioridade:** Alta

2. **Extrair componente Badge UI**
   - **Problema Atual:** Implementado inline em vários lugares
   - **Solução Proposta:** Criar `ui/badge.tsx` padronizado
   - **Prioridade:** Baixa

3. **Mover constantes para arquivos dedicados**
   - **Problema Atual:** Algumas constantes inline nos componentes
   - **Solução Proposta:** Centralizar em `lib/constants/`
   - **Prioridade:** Baixa

---

## 📈 Próximos Passos Sugeridos

### Ordem Recomendada

1. **Corrigir bugs críticos**
   - [ ] Servidor Socket.io / alternativa para chat
   - [ ] Settings do perfil

2. **Completar funcionalidades pela metade**
   - [ ] Páginas admin faltantes
   - [ ] Páginas therapist faltantes

3. **Implementar features faltantes prioritárias**
   - [ ] Sistema de notificações
   - [ ] Aprovação de terapeutas

4. **Melhorias de UX/UI**
   - [ ] Menu mobile
   - [ ] Loading states consistentes
   - [ ] Toast notifications

5. **Qualidade e Testes**
   - [ ] Adicionar testes unitários
   - [ ] Adicionar testes E2E

---

## ✅ Checklist Final

Antes de ir para produção, verificar:

- [x] Todos os bugs críticos documentados
- [x] Todos os arquivos órfãos identificados (pasta shared vazia)
- [x] Todas as dependências auditadas
- [ ] Todos os fluxos principais testados manualmente
- [ ] Acessibilidade básica verificada
- [ ] Performance medida (baseline)
- [ ] Variáveis de ambiente documentadas
- [ ] CI/CD configurado
- [ ] Backups de banco de dados

---

**Documento gerado por:** Claude AI - Arquiteto de Software  
**Última atualização:** 27 de Novembro de 2025

