"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Crown } from "lucide-react"

interface VideoTileProps {
  participant: any // Daily.co participant object
  isLocal?: boolean
  isTherapist?: boolean
}

export function VideoTile({ participant, isLocal = false, isTherapist = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!videoRef.current || !participant) return

    // Handle video track
    if (participant.videoTrack) {
      const stream = new MediaStream([participant.videoTrack])
      videoRef.current.srcObject = stream
    } else {
      videoRef.current.srcObject = null
    }

    // Handle audio track
    if (participant.audioTrack && audioRef.current) {
      const audioStream = new MediaStream([participant.audioTrack])
      audioRef.current.srcObject = audioStream
    }
  }, [participant?.videoTrack, participant?.audioTrack])

  if (!participant) {
    return (
      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Avatar className="w-16 h-16 mx-auto mb-2">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  const hasVideo = participant.videoTrack && participant.video
  const hasAudio = participant.audioTrack && participant.audio
  const displayName = participant.user_name || "Participante"

  return (
    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
      {/* Video Element */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal} // Mute local video to prevent feedback
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-gray-600">
              <AvatarImage src="" />
              <AvatarFallback className="text-xl bg-gray-600">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-medium">{displayName}</p>
          </div>
        </div>
      )}

      {/* Audio Element (hidden) */}
      {hasAudio && !isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          className="hidden"
        />
      )}

      {/* Name Badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black bg-opacity-60 px-3 py-1 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {displayName}
            </span>
            {isLocal && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Você
              </Badge>
            )}
            {isTherapist && (
              <Crown className="w-3 h-3 text-yellow-400" />
            )}
          </div>
        </div>
      </div>

      {/* Audio Indicator */}
      <div className="absolute bottom-3 right-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          hasAudio ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {hasAudio ? (
            <Mic className="w-4 h-4 text-white" />
          ) : (
            <MicOff className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Connection Quality Indicator */}
      {participant.connectionQuality && participant.connectionQuality < 80 && (
        <div className="absolute top-3 right-3">
          <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
            Conexão: {participant.connectionQuality}%
          </div>
        </div>
      )}
    </div>
  )
}

