"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LevelBadge } from "./level-badge"
import { StreakBadge } from "./streak-display"
import { ChevronLeft, ChevronRight, Crown, Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardUser {
  position: number
  userId: string
  name: string
  image?: string
  level: number
  totalPoints: number
  periodPoints: number
  currentStreak: number
}

interface LeaderboardTableProps {
  users: LeaderboardUser[]
  currentUserId?: string
  totalCount: number
  itemsPerPage?: number
  className?: string
}

export function LeaderboardTable({
  users,
  currentUserId,
  totalCount,
  itemsPerPage = 10,
  className
}: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />
    if (position === 2) return <Trophy className="h-4 w-4 text-gray-400" />
    if (position === 3) return <Medal className="h-4 w-4 text-orange-500" />
    return null
  }

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      const colors = ["bg-yellow-100 text-yellow-800", "bg-gray-100 text-gray-800", "bg-orange-100 text-orange-800"]
      return colors[position - 1]
    }
    return "bg-muted text-muted-foreground"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking Completo
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Pos.</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="text-center">Nível</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead className="text-center">Sequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => {
                const isCurrentUser = user.userId === currentUserId

                return (
                  <TableRow
                    key={user.userId}
                    className={cn(
                      "transition-colors",
                      isCurrentUser && "bg-primary/5 border-primary/20",
                      user.position <= 3 && "bg-muted/50"
                    )}
                  >
                    {/* Position */}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold min-w-[2.5rem] justify-center",
                            getPositionBadge(user.position)
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {getPositionIcon(user.position)}
                            {user.position}
                          </div>
                        </Badge>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium truncate max-w-[150px]" title={user.name}>
                            {user.name}
                          </div>
                          {user.position > 3 && (
                            <div className="text-xs text-muted-foreground">
                              #{user.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Level */}
                    <TableCell className="text-center">
                      <LevelBadge level={user.level} size="sm" />
                    </TableCell>

                    {/* Points */}
                    <TableCell className="text-right">
                      <div className="font-semibold">
                        {user.periodPoints.toLocaleString()}
                      </div>
                      {user.totalPoints !== user.periodPoints && (
                        <div className="text-xs text-muted-foreground">
                          Total: {user.totalPoints.toLocaleString()}
                        </div>
                      )}
                    </TableCell>

                    {/* Streak */}
                    <TableCell className="text-center">
                      {user.currentStreak > 0 ? (
                        <StreakBadge
                          currentStreak={user.currentStreak}
                          type="daily"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalCount)} de {totalCount} usuários
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">
              Ainda não há usuários suficientes para mostrar o ranking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

