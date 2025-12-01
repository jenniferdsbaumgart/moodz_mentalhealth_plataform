"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Trash2, Wifi, WifiOff } from "lucide-react"
import { useSessionChat, type ChatMessage } from "@/hooks/use-session-chat"
import { cn } from "@/lib/utils"

interface SessionChatProps {
  sessionId: string
  userId: string
  userName: string
  isTherapist?: boolean
  className?: string
}

export function SessionChat({
  sessionId,
  userId,
  userName,
  isTherapist = false,
  className
}: SessionChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isConnected,
    isConnecting,
    sendMessage,
    deleteMessage,
    canDeleteMessages
  } = useSessionChat({
    sessionId,
    userId,
    userName,
    isTherapist
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={cn("flex flex-col h-full bg-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-medium">Chat da Sessão</h3>
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Conectando...
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <Wifi className="w-3 h-3" />
              Conectado
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <WifiOff className="w-3 h-3" />
              Desconectado
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6" />
              </div>
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs text-gray-500 mt-1">
                Seja o primeiro a enviar uma mensagem!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.userId === userId
              const isDeleted = message.isDeleted

              if (isDeleted && !canDeleteMessages) {
                return null // Don't show deleted messages to regular users
              }

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 group",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-gray-600">
                      {message.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Content */}
                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    isOwnMessage ? "items-end" : "items-start"
                  )}>
                    {/* Message Header */}
                    <div className={cn(
                      "flex items-center gap-2 mb-1",
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    )}>
                      <span className="text-white text-sm font-medium">
                        {isOwnMessage ? "Você" : message.userName}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                      {canDeleteMessages && !isDeleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={cn(
                      "rounded-lg px-3 py-2 max-w-full break-words",
                      isDeleted
                        ? "bg-gray-700 text-gray-500 italic"
                        : isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-700 text-white"
                    )}>
                      {isDeleted ? (
                        <span className="text-xs">Mensagem deletada</span>
                      ) : (
                        <span className="text-sm">{message.content}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            placeholder={isConnected ? "Digite sua mensagem..." : "Conectando..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isConnecting}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected || isConnecting}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {!isConnected && !isConnecting && (
          <p className="text-red-400 text-xs mt-2">
            Você está desconectado. Tentando reconectar...
          </p>
        )}

        {isTherapist && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Modo Terapeuta
            </Badge>
            <span className="text-gray-400 text-xs">
              Você pode deletar mensagens
            </span>
          </div>
        )}
      </div>
    </div>
  )
}


