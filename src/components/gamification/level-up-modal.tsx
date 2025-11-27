"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LevelBadge } from "./level-badge"
import { Trophy, Sparkles, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to generate random sparkle positions
function generateSparklePositions(count: number) {
  return Array.from({ length: count }).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    repeatDelay: Math.random() * 3,
  }))
}

// Helper function to generate random confetti pieces
function generateConfettiPieces(count: number) {
  return Array.from({ length: count }).map(() => ({
    colorIndex: Math.floor(Math.random() * 5),
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
    rotate: Math.random() * 360,
    duration: Math.random() * 3 + 2,
  }))
}

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  levelName: string
  totalPoints: number
  onContinue?: () => void
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  levelName,
  totalPoints,
  onContinue
}: LevelUpModalProps) {
  // Generate random values once when component mounts
  const sparklePositions = useMemo(() => generateSparklePositions(20), [])
  const confettiPieces = useMemo(() => generateConfettiPieces(50), [])

  // Show confetti when modal opens
  const showConfetti = isOpen

  const handleContinue = () => {
    onContinue?.()
    onClose()
  }

  const getCelebrationEmoji = (level: number) => {
    if (level === 10) return "👑"
    if (level >= 8) return "🏆"
    if (level >= 5) return "🎉"
    return "🎊"
  }

  const getMotivationalMessage = (level: number) => {
    if (level === 10) return "Você alcançou a iluminação máxima!"
    if (level >= 8) return "Você é uma lenda na nossa comunidade!"
    if (level >= 5) return "Sua dedicação é inspiradora!"
    return "Continue crescendo e evoluindo!"
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="relative overflow-hidden">
            {/* Background Sparkles */}
            <div className="absolute inset-0 opacity-10">
              {sparklePositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: pos.x + "%",
                    y: pos.y + "%",
                    scale: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: pos.delay,
                    repeat: Infinity,
                    repeatDelay: pos.repeatDelay,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 text-center space-y-6 py-8">
              {/* Celebration Header */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="space-y-4"
              >
                <div className="text-6xl">
                  {getCelebrationEmoji(newLevel)}
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    LEVEL UP!
                  </h2>
                </motion.div>
              </motion.div>

              {/* Level Display */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <LevelBadge level={newLevel} size="lg" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Nível {newLevel}: {levelName}
                  </h3>
                  <p className="text-muted-foreground">
                    {totalPoints.toLocaleString()} pontos totais
                  </p>
                </div>
              </motion.div>

              {/* Motivational Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <p className="text-lg font-medium">
                  {getMotivationalMessage(newLevel)}
                </p>

                {/* Achievement Badges */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {newLevel >= 2 && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3" />
                      Explorador
                    </Badge>
                  )}
                  {newLevel >= 5 && (
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Veterano
                    </Badge>
                  )}
                  {newLevel >= 8 && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Mestre
                    </Badge>
                  )}
                  {newLevel === 10 && (
                    <Badge variant="outline" className="gap-1 bg-gradient-to-r from-purple-100 to-pink-100">
                      <Sparkles className="h-3 w-3" />
                      Iluminado
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continuar Jornada
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {confettiPieces.map((piece, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  ["bg-yellow-400", "bg-pink-400", "bg-purple-400", "bg-blue-400", "bg-green-400"][
                    piece.colorIndex
                  ]
                )}
                initial={{
                  x: piece.x,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 10,
                  rotate: piece.rotate,
                  x: piece.x,
                }}
                transition={{
                  duration: piece.duration,
                  ease: "easeOut",
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
