"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Trophy, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface PointsAnimationProps {
  points: number
  type?: "points" | "streak" | "level" | "badge"
  position?: { x: number; y: number }
  duration?: number
  className?: string
}

const typeConfig = {
  points: {
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    text: "pontos",
  },
  streak: {
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    text: "dias de streak",
  },
  level: {
    icon: Trophy,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    text: "nível up",
  },
  badge: {
    icon: Trophy,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    text: "badge conquistado",
  },
}

export function PointsAnimation({
  points,
  type = "points",
  position,
  duration = 2000,
  className
}: PointsAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const getAnimationVariants = () => ({
    initial: {
      opacity: 0,
      scale: 0.5,
      y: position ? position.y : 0,
      x: position ? position.x : 0,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: position ? position.y - 100 : -50,
      x: position ? position.x : 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position ? position.y - 150 : -100,
      transition: {
        duration: 0.5,
        ease: "easeIn" as const,
      },
    },
  })

  const getShakeVariants = () => ({
    animate: {
      x: [0, -2, 2, -2, 2, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    },
  })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed z-50 pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border",
            config.bgColor,
            className
          )}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            left: position ? `${position.x}px` : "50%",
            top: position ? `${position.y}px` : "50%",
            transform: position ? "translate(-50%, -50%)" : "translate(-50%, -50%)",
          }}
        >
          {/* Icon with shake animation */}
          <motion.div variants={getShakeVariants()} animate="animate">
            <Icon className={cn("h-5 w-5", config.color)} />
          </motion.div>

          {/* Points text */}
          <motion.span
            className="font-bold text-sm"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            +{points} {type === "points" ? config.text : ""}
          </motion.span>

          {/* Type indicator for special rewards */}
          {type !== "points" && (
            <motion.span
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {config.text}
            </motion.span>
          )}

          {/* Sparkle effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            <div className="w-full h-full rounded-full bg-white/20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to trigger points animation
export function usePointsAnimation() {
  const [animations, setAnimations] = useState<Array<{
    id: string
    points: number
    type: PointsAnimationProps["type"]
    position?: { x: number; y: number }
  }>>([])

  const triggerAnimation = (
    points: number,
    type: PointsAnimationProps["type"] = "points",
    position?: { x: number; y: number }
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setAnimations(prev => [...prev, { id, points, type, position }])

    // Remove animation after it completes
    setTimeout(() => {
      setAnimations(prev => prev.filter(anim => anim.id !== id))
    }, 2500)
  }

  const renderAnimations = () => (
    <>
      {animations.map(anim => (
        <PointsAnimation
          key={anim.id}
          points={anim.points}
          type={anim.type}
          position={anim.position}
        />
      ))}
    </>
  )

  return { triggerAnimation, renderAnimations }
}



