"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, Flame, Calendar, Trophy, Star } from "lucide-react"
import { useGamificationStats } from "@/hooks/use-wellness"
import { toast } from "sonner"

interface DailyCheckInProps {
  isOpen: boolean
  onClose: () => void
  onCheckInComplete?: () => void
}

export function DailyCheckIn({ isOpen, onClose, onCheckInComplete }: DailyCheckInProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [checkInResult, setCheckInResult] = useState<{
    isNewCheckIn: boolean
    currentStreak: number
    longestStreak: number
    pointsAwarded: number
    streakBonus?: number
    badgesAwarded?: string[]
  } | null>(null)
  const { data: gamificationData, refetch } = useGamificationStats()

  // Check if user has already checked in today when modal opens
  useEffect(() => {
    if (isOpen && gamificationData?.data) {
      // We'll check this via the API when the modal opens
      checkTodayStatus()
    }
  }, [isOpen, gamificationData])

  const checkTodayStatus = async () => {
    try {
      const response = await fetch("/api/gamification/checkin")
      if (response.ok) {
        const data = await response.json()
        setHasCheckedInToday(data.data.hasCheckedInToday)
        setCurrentStreak(data.data.currentStreak)
      }
    } catch (error) {
      console.error("Error checking today status:", error)
    }
  }

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      const response = await fetch("/api/gamification/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao realizar check-in")
      }

      const result = await response.json()
      setCheckInResult(result.data)
      setHasCheckedInToday(true)
      setCurrentStreak(result.data.currentStreak)

      // Refetch gamification stats
      refetch()

      toast.success("Check-in realizado com sucesso!")

      // Call completion callback
      onCheckInComplete?.()

    } catch (error) {
      console.error("Error during check-in:", error)
      toast.error("Erro ao realizar check-in. Tente novamente.")
    } finally {
      setIsCheckingIn(false)
    }
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return "🔥"
    if (streak >= 30) return "⭐"
    if (streak >= 7) return "🌟"
    return "✨"
  }

  const getMotivationalMessage = (streak: number) => {
    if (streak === 0) return "Comece sua jornada hoje!"
    if (streak === 1) return "Primeiro dia! Continue assim!"
    if (streak < 7) return `Sequência de ${streak} dias. Você está indo bem!`
    if (streak < 30) return `Incríveis ${streak} dias consecutivos!`
    return `Fantásticos ${streak} dias de consistência!`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-in Diário
          </DialogTitle>
          <DialogDescription>
            Marque sua presença diária e mantenha sua sequência!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Streak Display */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">
                  {hasCheckedInToday ? "✅" : getStreakEmoji(currentStreak)}
                </div>

                <div>
                  <div className="text-3xl font-bold text-primary">
                    {currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentStreak === 1 ? "dia consecutivo" : "dias consecutivos"}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {getMotivationalMessage(currentStreak)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Status */}
          {hasCheckedInToday ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-4xl">🎉</div>
                  <h3 className="font-semibold text-green-700 dark:text-green-300">
                    Check-in realizado hoje!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Volte amanhã para manter sua sequência.
                  </p>

                  {/* Show results if just completed */}
                  {checkInResult && (
                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>+{checkInResult.pointsAwarded} pontos</span>
                        </div>
                        {checkInResult.streakBonus && (
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>+{checkInResult.streakBonus} bônus</span>
                          </div>
                        )}
                      </div>

                      {checkInResult.badgesAwarded && checkInResult.badgesAwarded.length > 0 && (
                        <div className="flex justify-center">
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            Novos badges conquistados!
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🌅</div>
                  <h3 className="font-semibold">Pronto para o check-in?</h3>
                  <p className="text-sm text-muted-foreground">
                    Marque sua presença diária e ganhe pontos por manter a consistência.
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>+10 pontos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        <span>Sequência ativa</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    size="lg"
                    className="w-full gap-2"
                  >
                    {isCheckingIn ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        Realizando check-in...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Fazer Check-in Diário
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">
                    {gamificationData?.data?.moodStreak || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Sequência Humor</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {gamificationData?.data?.exerciseStreak || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Sequência Exercícios</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {gamificationData?.data?.totalMoodEntries || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Registros Totais</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
