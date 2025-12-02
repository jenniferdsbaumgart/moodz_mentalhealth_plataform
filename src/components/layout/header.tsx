"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { User, LogOut, Settings } from "lucide-react"
import { SearchTrigger } from "@/components/search/search-trigger"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Logo - visible on all screens */}
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-primary">Moodz</h1>
        </Link>

        {/* Search Trigger - centered on larger screens */}
        <div className="hidden flex-1 justify-center px-4 md:flex">
          <SearchTrigger className="max-w-md" />
        </div>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:flex-none">
          {/* Search icon for mobile */}
          <SearchTrigger variant="icon" className="md:hidden" />
          
          {/* Notifications */}
          {session?.user && <NotificationDropdown />}
          
          <ThemeToggle />

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <a href="/login">Entrar</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

