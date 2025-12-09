"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePusherClient } from '@/hooks/use-pusher'

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
  const channelRef = useRef<any>(null)

  const pusherClient = usePusherClient()

  // Connect to Pusher and join session channel
  useEffect(() => {
    if (!sessionId || !userId || hasJoinedRef.current || !pusherClient) return

    setIsConnecting(true)

    // Subscribe to session channel
    const channel = pusherClient.subscribe(`session-${sessionId}`)
    channelRef.current = channel

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

    // Bind events
    channel.bind('chat-message', handleChatMessage)
    channel.bind('message-deleted', handleMessageDeleted)

    // Load previous messages from API
    const loadPreviousMessages = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/chat`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.data || [])
        }
      } catch (error) {
        console.error('Error loading previous messages:', error)
      }
    }

    // Check connection status
    const checkConnection = () => {
      setIsConnected(pusherClient.connection.state === 'connected')
    }

    // Handle connection state changes
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true)
      setIsConnecting(false)
      loadPreviousMessages()
    })

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false)
    })

    checkConnection()
    hasJoinedRef.current = true

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
        pusherClient.unsubscribe(`session-${sessionId}`)
        channelRef.current = null
      }
    }
  }, [sessionId, userId, userName, pusherClient])

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current) {
        if (channelRef.current && pusherClient) {
          channelRef.current.unbind_all()
          pusherClient.unsubscribe(`session-${sessionId}`)
          channelRef.current = null
        }
        hasJoinedRef.current = false
      }
    }
  }, [sessionId])

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isConnected) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() })
      })

      if (!response.ok) {
        console.error('Failed to send message:', response.statusText)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [sessionId, isConnected])

  // Delete message function (therapist only)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!isTherapist || !isConnected) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId })
      })

      if (!response.ok) {
        console.error('Failed to delete message:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
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

