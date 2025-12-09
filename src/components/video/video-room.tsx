"use client"

import { useState, useEffect } from "react"
import { VideoGrid } from "./video-grid"
import { VideoControls } from "./video-controls"
import { ParticipantList } from "./participant-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionChat } from "./session-chat"

interface VideoRoomProps {
  room: any // Daily.co room instance
  sessionId: string
  onLeave: () => void
  isTherapist?: boolean
  therapistId?: string
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}


export function VideoRoom({ room, sessionId, onLeave, isTherapist = false, therapistId }: VideoRoomProps) {
  const [participants, setParticipants] = useState<Record<string, any>>({})
  const [localParticipantId, setLocalParticipantId] = useState<string>()
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (!room) return

    // Set up room event listeners
    const handleParticipantJoined = (evt: any) => {
      setParticipants(prev => ({
        ...prev,
        [evt.participant.sessionId]: evt.participant
      }))
    }

    const handleParticipantUpdated = (evt: any) => {
      setParticipants(prev => ({
        ...prev,
        [evt.participant.sessionId]: evt.participant
      }))
    }

    const handleParticipantLeft = (evt: any) => {
      setParticipants(prev => {
        const newParticipants = { ...prev }
        delete newParticipants[evt.participant.sessionId]
        return newParticipants
      })
    }

    const handleAppMessage = (evt: any) => {
      if (evt.data.type === 'chat') {
        const message: ChatMessage = {
          id: evt.data.id || Date.now().toString(),
          userId: evt.data.userId,
          userName: evt.data.userName,
          content: evt.data.content,
          timestamp: new Date(),
        }
        setChatMessages(prev => [...prev, message])
      }
    }

    // Get initial participants
    setParticipants(room.participants || {})
    setLocalParticipantId(room.participantsLocal?.sessionId)

    // Set up audio/video state
    setIsAudioEnabled(room.localAudio)
    setIsVideoEnabled(room.localVideo)

    // Add event listeners
    room.on('participant-joined', handleParticipantJoined)
    room.on('participant-updated', handleParticipantUpdated)
    room.on('participant-left', handleParticipantLeft)
    room.on('app-message', handleAppMessage)

    return () => {
      // Cleanup listeners
      room.off('participant-joined', handleParticipantJoined)
      room.off('participant-updated', handleParticipantUpdated)
      room.off('participant-left', handleParticipantLeft)
      room.off('app-message', handleAppMessage)
    }
  }, [room])

  const handleToggleAudio = () => {
    if (room) {
      room.setLocalAudio(!isAudioEnabled)
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const handleToggleVideo = () => {
    if (room) {
      room.setLocalVideo(!isVideoEnabled)
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const handleToggleScreenShare = () => {
    if (!room || !isTherapist) return

    if (isScreenSharing) {
      room.stopScreenShare()
      setIsScreenSharing(false)
    } else {
      room.startScreenShare()
      setIsScreenSharing(true)
    }
  }


  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Carregando sala...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-white text-lg font-semibold">Sala de Terapia</h1>
            <p className="text-gray-300 text-sm">
              {Object.keys(participants).length} participante{Object.keys(participants).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <VideoGrid
            participants={participants}
            localParticipantId={localParticipantId}
            therapistId={therapistId}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <Tabs defaultValue="participants" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="flex-1 m-4 mt-2">
              <ParticipantList participants={participants} />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 p-4 pt-2">
              <SessionChat
                sessionId={sessionId}
                userId={room.participantsLocal?.user_id || ""}
                userName={room.participantsLocal?.user_name || "Participante"}
                isTherapist={isTherapist}
                className="h-full"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Controls */}
      <VideoControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
        isTherapist={isTherapist}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onLeave={onLeave}
      />
    </div>
  )
}
