"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { socketManager } from '@/lib/socket'

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  content: string
  timestamp: string
  isDeleted?: boolean
  deletedBy?: string
}

interface UseSessionChatOptions {
  sessionId: string
  userId: string
  userName: string
  isTherapist?: boolean
}

export function useSessionChat({
  sessionId,
  userId,
  userName,
  isTherapist = false
}: UseSessionChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const hasJoinedRef = useRef(false)

  // Connect to socket and join session
  useEffect(() => {
    if (!sessionId || !userId || hasJoinedRef.current) return

    setIsConnecting(true)

    // Connect to socket
    const socket = socketManager.connect()

    // Set up event listeners
    const handleChatMessage = (message: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    }

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, isDeleted: true }
            : msg
        )
      )
    }

    const handlePreviousMessages = (previousMessages: ChatMessage[]) => {
      setMessages(previousMessages)
    }

    // Listen for events
    socketManager.onChatMessage(handleChatMessage)
    socketManager.onMessageDeleted(handleMessageDeleted)
    socketManager.onPreviousMessages(handlePreviousMessages)

    // Join session
    socketManager.joinSession(sessionId, userId, userName)

    // Check connection status
    const checkConnection = () => {
      setIsConnected(socketManager.isConnected())
    }

    checkConnection()
    const interval = setInterval(checkConnection, 1000)

    hasJoinedRef.current = true
    setIsConnecting(false)

    // Cleanup
    return () => {
      clearInterval(interval)
      socketManager.offChatMessage()
      socketManager.offMessageDeleted()
      socketManager.offPreviousMessages()
    }
  }, [sessionId, userId, userName])

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current) {
        socketManager.leaveSession(sessionId, userId)
        hasJoinedRef.current = false
      }
    }
  }, [sessionId, userId])

  // Send message function
  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !isConnected) return

    socketManager.sendMessage(sessionId, content.trim(), userId, userName)
  }, [sessionId, userId, userName, isConnected])

  // Delete message function (therapist only)
  const deleteMessage = useCallback((messageId: string) => {
    if (!isTherapist || !isConnected) return

    socketManager.deleteMessage(sessionId, messageId)
  }, [sessionId, isTherapist, isConnected])

  // Get active (non-deleted) messages
  const activeMessages = messages.filter(msg => !msg.isDeleted)

  return {
    messages: activeMessages,
    allMessages: messages, // Including deleted ones for admin view
    isConnected,
    isConnecting,
    sendMessage,
    deleteMessage,
    canDeleteMessages: isTherapist,
  }
}
