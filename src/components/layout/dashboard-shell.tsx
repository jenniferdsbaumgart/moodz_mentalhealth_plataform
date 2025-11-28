import { Role } from "@prisma/client"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { PageHeader } from "./page-header"
import { PAGE_SPACING, CONTAINER } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  role: Role
  title?: string
  description?: string
  action?: React.ReactNode
  /** Largura máxima do conteúdo */
  maxWidth?: keyof typeof CONTAINER
}

export function DashboardShell({
  children,
  role,
  title,
  description,
  action,
  maxWidth = "dashboard"
}: DashboardShellProps) {
  const hasHeader = title || description || action

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className={cn(PAGE_SPACING.pagePadding, "flex-1")}>
          <div className={cn(CONTAINER[maxWidth], "mx-auto", PAGE_SPACING.sections)}>
            {hasHeader && (
              <PageHeader
                title={title || ""}
                description={description}
                action={action}
              />
            )}
            <div className={PAGE_SPACING.content}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

