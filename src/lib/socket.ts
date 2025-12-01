import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(url?: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    const socketUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to socket server')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.handleReconnect()
    })

    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect()
        }
      }, 1000 * this.reconnectAttempts) // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Session chat events
  joinSession(sessionId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('join-session', { sessionId, userId, userName })
    }
  }

  leaveSession(sessionId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leave-session', { sessionId, userId })
    }
  }

  sendMessage(sessionId: string, content: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('send-message', {
        sessionId,
        content,
        userId,
        userName,
        timestamp: new Date().toISOString()
      })
    }
  }

  deleteMessage(sessionId: string, messageId: string) {
    if (this.socket) {
      this.socket.emit('delete-message', { sessionId, messageId })
    }
  }

  // Event listeners
  onChatMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback)
    }
  }

  onMessageDeleted(callback: (data: { messageId: string }) => void) {
    if (this.socket) {
      this.socket.on('message-deleted', callback)
    }
  }

  onPreviousMessages(callback: (messages: any[]) => void) {
    if (this.socket) {
      this.socket.on('previous-messages', callback)
    }
  }

  offChatMessage() {
    if (this.socket) {
      this.socket.off('chat-message')
    }
  }

  offMessageDeleted() {
    if (this.socket) {
      this.socket.off('message-deleted')
    }
  }

  offPreviousMessages() {
    if (this.socket) {
      this.socket.off('previous-messages')
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager()

// Convenience functions
export const getSocket = () => socketManager.getSocket()
export const isConnected = () => socketManager.isConnected()

// Default export
export default socketManager


