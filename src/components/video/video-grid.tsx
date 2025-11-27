"use client"

import { VideoTile } from "./video-tile"

interface VideoGridProps {
  participants: Record<string, any>
  localParticipantId?: string
  therapistId?: string
}

export function VideoGrid({ participants, localParticipantId, therapistId }: VideoGridProps) {
  const participantList = Object.values(participants || {})

  if (participantList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Aguardando participantes...</h3>
          <p className="text-sm">A sessão começará quando outros participantes entrarem.</p>
        </div>
      </div>
    )
  }

  // Determine grid layout based on participant count
  const getGridClasses = (count: number) => {
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-1 md:grid-cols-2"
    if (count <= 4) return "grid-cols-2 md:grid-cols-2"
    if (count <= 9) return "grid-cols-2 md:grid-cols-3"
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }

  return (
    <div className={`grid ${getGridClasses(participantList.length)} gap-4 p-4 h-full overflow-y-auto`}>
      {participantList.map((participant: any) => (
        <VideoTile
          key={participant.sessionId}
          participant={participant}
          isLocal={participant.sessionId === localParticipantId}
          isTherapist={participant.user_id === therapistId}
        />
      ))}
    </div>
  )
}
