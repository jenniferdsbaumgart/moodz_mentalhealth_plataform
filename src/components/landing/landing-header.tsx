"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">Moodz</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Funcionalidades
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Como Funciona
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Planos
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Blog
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Ir para o App</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Criar Conta</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            className="p-2 text-muted-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="container py-4 px-4 flex flex-col gap-4">
            <Link 
              href="#features" 
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Planos
            </Link>
             <Link 
              href="/blog" 
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t">
              {session ? (
                 <Button asChild className="w-full">
                  <Link href="/dashboard">Ir para o App</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Criar Conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

