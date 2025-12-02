"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Check,
  X,
  Calendar,
  Users,
  MessageSquare,
  Trophy,
  AlertTriangle,
  Bell,
  Star,
  Megaphone,
  TrendingUp,
  Clock,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
  showMarkAsRead?: boolean
  showDelete?: boolean
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "SESSION_REMINDER":
      return Clock
    case "SESSION_STARTING":
      return Calendar
    case "SESSION_CANCELLED":
      return XCircle
    case "NEW_MESSAGE":
      return MessageSquare
    case "NEW_BADGE":
      return Trophy
    case "STREAK_RISK":
      return AlertTriangle
    case "STREAK_ACHIEVED":
      return TrendingUp
    case "THERAPIST_APPROVED":
      return Users
    case "NEW_REVIEW":
      return Star
    case "NEW_POST_REPLY":
    case "POST_UPVOTED":
      return MessageSquare
    case "SYSTEM_ANNOUNCEMENT":
    case "WEEKLY_SUMMARY":
      return Megaphone
    default:
      return Bell
  }
}

const getNotificationStyle = (type: string) => {
  switch (type) {
    case "SESSION_REMINDER":
      return {
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      }
    case "SESSION_STARTING":
      return {
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      }
    case "SESSION_CANCELLED":
      return {
        iconColor: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      }
    case "NEW_BADGE":
    case "STREAK_ACHIEVED":
      return {
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      }
    case "STREAK_RISK":
      return {
        iconColor: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      }
    case "THERAPIST_APPROVED":
      return {
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    case "NEW_REVIEW":
      return {
        iconColor: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      }
    case "NEW_POST_REPLY":
    case "POST_UPVOTED":
      return {
        iconColor: "text-indigo-600",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
      }
    case "SYSTEM_ANNOUNCEMENT":
    case "WEEKLY_SUMMARY":
      return {
        iconColor: "text-teal-600",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200"
      }
    default:
      return {
        iconColor: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      }
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
  showMarkAsRead = true,
  showDelete = true
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = getNotificationIcon(notification.type)
  const style = getNotificationStyle(notification.type)

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }

    // Navigate to link if available
    if (notification.data?.link) {
      window.location.href = notification.data.link
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(notification.id)
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 cursor-pointer transition-colors",
          "hover:bg-muted/50",
          !notification.read && "bg-primary/5 border-l-4 border-l-primary"
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("mt-0.5 p-1.5 rounded-full", style.bgColor)}>
          <Icon className={cn("h-3.5 w-3.5", style.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            !notification.read ? "text-foreground" : "text-muted-foreground"
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {notification.message}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ptBR
            })}
          </span>

          {isHovered && (showMarkAsRead || showDelete) && (
            <div className="flex gap-1 ml-1">
              {showMarkAsRead && !notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleMarkAsRead}
                  title="Marcar como lida"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  title="Remover"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 cursor-pointer transition-all group",
        "hover:bg-muted/50",
        !notification.read && "bg-primary/5"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className={cn(
        "p-2.5 rounded-full shrink-0",
        style.bgColor
      )}>
        <Icon className={cn("h-5 w-5", style.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-sm font-semibold mb-1",
              !notification.read ? "text-foreground" : "text-muted-foreground"
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {notification.message}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-1 shrink-0 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            {showMarkAsRead && !notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleMarkAsRead}
                title="Marcar como lida"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {showDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                title="Remover"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-2" />
      )}
    </div>
  )
}
