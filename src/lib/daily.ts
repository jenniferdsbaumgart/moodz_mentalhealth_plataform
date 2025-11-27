import React, { useState, useEffect } from 'react'
import Daily from '@daily-co/daily-js'

// Configuração do Daily.co
const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_DOMAIN = process.env.DAILY_DOMAIN

if (!DAILY_API_KEY) {
  throw new Error('DAILY_API_KEY is required')
}

if (!DAILY_DOMAIN) {
  throw new Error('DAILY_DOMAIN is required')
}

// Headers para autenticação com Daily.co
const getAuthHeaders = () => ({
  Authorization: `Bearer ${DAILY_API_KEY}`,
  'Content-Type': 'application/json',
})

// Cria uma sala privada no Daily.co
export async function createDailyRoom(sessionId: string) {
  try {
    const roomName = `session-${sessionId}`

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          max_participants: 50,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          start_video_off: false,
          start_audio_off: false,
          owner_only_broadcast: false,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create Daily room: ${error.error}`)
    }

    const room = await response.json()

    return {
      roomName: room.name,
      roomUrl: room.url,
      roomId: room.id,
    }
  } catch (error) {
    console.error('Error creating Daily room:', error)
    throw error
  }
}

// Gera um token de reunião para um usuário
export async function createMeetingToken(
  roomName: string,
  userId: string,
  userName: string,
  isOwner: boolean = false
) {
  try {
    const response = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          user_name: userName,
          is_owner: isOwner,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          enable_recording: isOwner, // Only owners can record
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create meeting token: ${error.error}`)
    }

    const tokenData = await response.json()
    return tokenData.token
  } catch (error) {
    console.error('Error creating meeting token:', error)
    throw error
  }
}

// Deleta uma sala do Daily.co
export async function deleteDailyRoom(roomName: string) {
  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok && response.status !== 404) {
      const error = await response.json()
      throw new Error(`Failed to delete Daily room: ${error.error}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting Daily room:', error)
    throw error
  }
}

// Obtém informações de uma sala
export async function getDailyRoom(roomName: string) {
  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const error = await response.json()
      throw new Error(`Failed to get Daily room: ${error.error}`)
    }

    const room = await response.json()
    return room
  } catch (error) {
    console.error('Error getting Daily room:', error)
    throw error
  }
}

// Cliente Daily para componentes React
export { Daily }

// Hook para usar Daily em componentes React
export function useDailyRoom(roomUrl: string | null) {
  const [room, setRoom] = React.useState<any>(null)
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
    leaveRoom,
  }
}
