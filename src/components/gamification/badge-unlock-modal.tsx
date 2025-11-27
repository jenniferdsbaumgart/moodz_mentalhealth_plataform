"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Medal, Sparkles, Star, Trophy, Zap, Heart } from "lucide-react"
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
    colorIndex: Math.floor(Math.random() * 6),
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
    rotate: Math.random() * 720,
    duration: Math.random() * 3 + 2,
  }))
}

interface BadgeUnlockModalProps {
  isOpen: boolean
  onClose: () => void
  badges: Array<{
    id: string
    name: string
    slug: string
    description: string
    icon: string
    category: string
    rarity: string
    pointsReward: number
  }>
  onContinue?: () => void
}

const rarityConfig = {
  COMMON: {
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    label: "Comum",
    glow: "shadow-gray-200",
  },
  UNCOMMON: {
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    label: "Incomum",
    glow: "shadow-green-200",
  },
  RARE: {
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    label: "Raro",
    glow: "shadow-blue-200",
  },
  EPIC: {
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    label: "Épico",
    glow: "shadow-purple-200",
  },
  LEGENDARY: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    label: "Lendário",
    glow: "shadow-yellow-200",
  },
} as const

const categoryIcons = {
  MILESTONE: Medal,
  COMMUNITY: Heart,
  SESSIONS: Star,
  WELLNESS: Sparkles,
  SOCIAL: Heart,
  SPECIAL: Trophy,
} as const

export function BadgeUnlockModal({
  isOpen,
  onClose,
  badges,
  onContinue
}: BadgeUnlockModalProps) {
  // Generate random values once when component mounts
  const sparklePositions = useMemo(() => generateSparklePositions(15), [])
  const confettiPieces = useMemo(() => generateConfettiPieces(30), [])

  // Reset badge index and show confetti when modal opens
  const currentBadgeIndex = isOpen && badges.length > 0 ? 0 : 0
  const showConfetti = isOpen && badges.length > 0

  const handleContinue = () => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1)
    } else {
      onContinue?.()
      onClose()
    }
  }

  const currentBadge = badges[currentBadgeIndex]
  if (!currentBadge) return null

  const rarity = rarityConfig[currentBadge.rarity as keyof typeof rarityConfig] || rarityConfig.COMMON
  const CategoryIcon = categoryIcons[currentBadge.category as keyof typeof categoryIcons] || Medal

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY": return "👑"
      case "EPIC": return "💎"
      case "RARE": return "💫"
      case "UNCOMMON": return "✨"
      default: return "🏅"
    }
  }

  const getCongratulationMessage = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY": return "Uma conquista verdadeiramente lendária!"
      case "EPIC": return "Uma realização épica!"
      case "RARE": return "Uma conquista rara e especial!"
      case "UNCOMMON": return "Excelente trabalho!"
      default: return "Parabéns pela conquista!"
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-5">
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
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: pos.delay,
                    repeat: Infinity,
                    repeatDelay: pos.repeatDelay,
                  }}
                >
                  <Sparkles className={cn("h-3 w-3", rarity.color)} />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 text-center space-y-6 py-8">
              {/* Header */}
              <motion.div
                key={currentBadge.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="space-y-4"
              >
                <div className="text-5xl">
                  {getRarityEmoji(currentBadge.rarity)}
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NOVO BADGE CONQUISTADO!
                  </h2>
                </motion.div>
              </motion.div>

              {/* Badge Display */}
              <motion.div
                key={`badge-${currentBadge.id}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="space-y-4"
              >
                {/* Badge Icon */}
                <div className={cn(
                  "mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 shadow-lg",
                  rarity.bgColor,
                  rarity.borderColor,
                  rarity.glow
                )}>
                  {currentBadge.icon}
                </div>

                {/* Badge Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {currentBadge.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentBadge.description}
                  </p>

                  {/* Rarity and Category */}
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className={cn("gap-1", rarity.color)}>
                      {rarity.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <CategoryIcon className="h-3 w-3" />
                      {currentBadge.category}
                    </Badge>
                  </div>

                  {/* Points Reward */}
                  {currentBadge.pointsReward > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>+{currentBadge.pointsReward} pontos bônus</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Congratulation Message */}
              <motion.div
                key={`message-${currentBadge.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-base font-medium">
                  {getCongratulationMessage(currentBadge.rarity)}
                </p>
              </motion.div>

              {/* Progress Indicator */}
              {badges.length > 1 && (
                <div className="flex justify-center gap-1">
                  {badges.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentBadgeIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentBadgeIndex < badges.length - 1 ? "Próximo Badge" : "Continuar"}
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
                  "absolute w-1 h-6 rounded-full",
                  ["bg-yellow-400", "bg-pink-400", "bg-purple-400", "bg-blue-400", "bg-green-400", "bg-orange-400"][
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
