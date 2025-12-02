"use client"

import { useState, useEffect } from 'react'
import Daily from '@daily-co/daily-js'

// Hook para usar Daily em componentes React
export function useDailyRoom(roomUrl: string | null) {
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomUrl) return

    setIsLoading(true)
    setError(null)

    try {
      const dailyRoom = Daily.createCallObject()

      dailyRoom.on('joined-meeting', () => {
        setIsLoading(false)
      })

      dailyRoom.on('error', (evt: any) => {
        setError(evt.errorMsg)
        setIsLoading(false)
      })

      setRoom(dailyRoom)
    } catch (err) {
      setError('Failed to initialize Daily room')
      setIsLoading(false)
    }

    return () => {
      if (room) {
        room.destroy()
      }
    }
  }, [roomUrl])

  const joinRoom = async (token?: string) => {
    if (!room || !roomUrl) return

    try {
      await room.join({ url: roomUrl, token })
    } catch (err) {
      setError('Failed to join room')
      throw err
    }
  }

  const leaveRoom = async () => {
    if (!room) return

    try {
      await room.leave()
    } catch (err) {
      console.error('Error leaving room:', err)
    }
  }

  return {
    room,
    isLoading,
    error,
    joinRoom,
    leaveRoom
  }
}

// Export Daily client
export { Daily }


