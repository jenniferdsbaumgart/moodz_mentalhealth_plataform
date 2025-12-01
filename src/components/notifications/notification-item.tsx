"use client"

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, X, Calendar, Users, MessageSquare, Trophy, AlertTriangle, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    case 'SESSION_REMINDER':
    case 'SESSION_STARTING':
      return Calendar
    case 'NEW_MESSAGE':
      return MessageSquare
    case 'NEW_BADGE':
      return Trophy
    case 'STREAK_RISK':
      return AlertTriangle
    case 'THERAPIST_APPROVED':
      return Users
    default:
      return Bell
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'SESSION_REMINDER':
      return 'text-blue-600'
    case 'SESSION_STARTING':
      return 'text-red-600'
    case 'NEW_BADGE':
      return 'text-yellow-600'
    case 'STREAK_RISK':
      return 'text-orange-600'
    case 'THERAPIST_APPROVED':
      return 'text-green-600'
    default:
      return 'text-gray-600'
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
  const iconColor = getNotificationColor(notification.type)

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
          "flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors",
          !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("mt-0.5", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            !notification.read ? "text-gray-900" : "text-gray-600"
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {notification.message}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ptBR
            })}
          </span>

          {isHovered && (showMarkAsRead || showDelete) && (
            <div className="flex gap-1">
              {showMarkAsRead && !notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={handleDelete}
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
        "flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
        !notification.read && "bg-blue-50 border-blue-200"
      )}
      onClick={handleClick}
    >
      <div className={cn("mt-1", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-semibold mb-1",
              !notification.read ? "text-gray-900" : "text-gray-700"
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>

          {(showMarkAsRead || showDelete) && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {showMarkAsRead && !notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  )
}