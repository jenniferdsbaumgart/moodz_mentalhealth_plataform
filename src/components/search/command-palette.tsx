"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Home,
  Users,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  User,
  FileText,
  Award,
  BarChart,
  Shield,
  LogOut,
  Moon,
  Sun,
  BookOpen,
  Bell,
  Loader2,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchResult {
  id: string
  type: "post" | "session" | "user" | "blog" | "therapist"
  title: string
  description?: string
  url: string
}

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  url: string
  shortcut?: string
  keywords?: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter()
  const { data: session } = useSession()
  const { setTheme, theme } = useTheme()
  const debouncedSearch = useDebounce(search, 300)

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search API when debounced search changes
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setResults([])
      return
    }

    const searchContent = async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }

    searchContent()
  }, [debouncedSearch])

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("")
      setResults([])
    }
  }, [open])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const navigate = useCallback(
    (url: string) => {
      runCommand(() => router.push(url))
    },
    [router, runCommand]
  )

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const role = (session?.user as any)?.role
    const items: NavigationItem[] = []

    // Common items for all authenticated users
    items.push(
      { icon: Home, label: "Dashboard", url: "/dashboard", shortcut: "D", keywords: ["home", "início"] },
      { icon: Bell, label: "Notificações", url: "/notifications", shortcut: "N", keywords: ["alerts", "avisos"] },
      { icon: User, label: "Meu Perfil", url: "/profile", shortcut: "P", keywords: ["account", "conta"] },
      { icon: Settings, label: "Configurações", url: "/settings", shortcut: "S", keywords: ["settings", "preferências"] }
    )

    // Patient-specific items
    if (role === "PATIENT" || !role) {
      items.push(
        { icon: Calendar, label: "Sessões", url: "/sessions", shortcut: "E", keywords: ["therapy", "terapia", "agendar"] },
        { icon: Heart, label: "Bem-estar", url: "/wellness", shortcut: "W", keywords: ["health", "saúde", "humor"] },
        { icon: MessageSquare, label: "Comunidade", url: "/community", shortcut: "C", keywords: ["forum", "posts", "discussão"] },
        { icon: Award, label: "Conquistas", url: "/gamification", shortcut: "A", keywords: ["badges", "pontos", "streak"] },
        { icon: BookOpen, label: "Blog", url: "/blog", shortcut: "B", keywords: ["artigos", "leitura"] },
        { icon: Stethoscope, label: "Terapeutas", url: "/therapists", keywords: ["profissionais", "psicólogos"] }
      )
    }

    // Therapist-specific items
    if (role === "THERAPIST") {
      items.push(
        { icon: Calendar, label: "Minhas Sessões", url: "/therapist/sessions", shortcut: "E", keywords: ["agenda", "atendimentos"] },
        { icon: Users, label: "Pacientes", url: "/therapist/patients", shortcut: "T", keywords: ["clientes", "atendidos"] },
        { icon: BarChart, label: "Analytics", url: "/therapist/analytics", shortcut: "A", keywords: ["estatísticas", "métricas"] },
        { icon: Calendar, label: "Agenda", url: "/therapist/schedule", shortcut: "G", keywords: ["disponibilidade", "horários"] },
        { icon: MessageSquare, label: "Avaliações", url: "/therapist/reviews", keywords: ["feedback", "reviews"] }
      )
    }

    // Admin-specific items
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      items.push(
        { icon: Users, label: "Usuários", url: "/admin/users", shortcut: "U", keywords: ["gerenciar", "accounts"] },
        { icon: Shield, label: "Moderação", url: "/admin/moderation", shortcut: "M", keywords: ["reports", "denúncias"] },
        { icon: FileText, label: "Relatórios", url: "/admin/reports", shortcut: "R", keywords: ["reports", "exportar"] },
        { icon: BarChart, label: "Analytics", url: "/admin/analytics", keywords: ["métricas", "dashboard"] }
      )
    }

    // Super Admin-specific items
    if (role === "SUPER_ADMIN") {
      items.push(
        { icon: Shield, label: "Administradores", url: "/super-admin/admins", keywords: ["admins", "gerenciar"] },
        { icon: Settings, label: "Sistema", url: "/super-admin/system", keywords: ["configurações", "features"] },
        { icon: FileText, label: "Auditoria", url: "/super-admin/audit", keywords: ["logs", "histórico"] }
      )
    }

    return items
  }

  const navigationItems = getNavigationItems()

  const getResultIcon = (type: string) => {
    switch (type) {
      case "post":
        return <MessageSquare className="mr-2 h-4 w-4" />
      case "session":
        return <Calendar className="mr-2 h-4 w-4" />
      case "user":
        return <User className="mr-2 h-4 w-4" />
      case "blog":
        return <BookOpen className="mr-2 h-4 w-4" />
      case "therapist":
        return <Stethoscope className="mr-2 h-4 w-4" />
      default:
        return <Search className="mr-2 h-4 w-4" />
    }
  }

  return (
    <>
      {/* Floating button for mobile */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg md:hidden"
        aria-label="Abrir busca"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar ou digitar um comando..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            ) : search.length > 0 ? (
              "Nenhum resultado encontrado."
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Digite para buscar ou navegue pelos comandos
                </p>
              </div>
            )}
          </CommandEmpty>

          {/* Search Results */}
          {results.length > 0 && (
            <>
              <CommandGroup heading="Resultados da busca">
                {results.slice(0, 5).map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    value={`${result.title} ${result.description || ""}`}
                    onSelect={() => navigate(result.url)}
                  >
                    {getResultIcon(result.type)}
                    <div className="flex flex-col">
                      <span>{result.title}</span>
                      {result.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {result.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Navigation */}
          <CommandGroup heading="Navegação">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.url}
                value={`${item.label} ${item.keywords?.join(" ") || ""}`}
                onSelect={() => navigate(item.url)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.shortcut && <CommandShortcut>⌘{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Actions */}
          <CommandGroup heading="Ações">
            <CommandItem
              value="alternar tema toggle theme dark light escuro claro"
              onSelect={() =>
                runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Alternar tema</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>

            {session?.user && (
              <CommandItem
                value="logout sair desconectar"
                onSelect={() => runCommand(() => signOut({ callbackUrl: "/" }))}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
                <CommandShortcut>⌘Q</CommandShortcut>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

