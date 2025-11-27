"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Crown, Hand } from "lucide-react"

interface Participant {
  sessionId: string
  user_id: string
  user_name?: string
  video?: boolean
  audio?: boolean
  screenVideo?: boolean
  isTherapist?: boolean
  handRaised?: boolean
}

interface ParticipantListProps {
  participants: Record<string, Participant>
  maxHeight?: string
}

export function ParticipantList({ participants, maxHeight = "400px" }: ParticipantListProps) {
  const participantList = Object.values(participants || [])

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-medium">
          Participantes ({participantList.length})
        </h3>
      </div>

      <ScrollArea className={`max-h-[${maxHeight}]`}>
        <div className="p-2">
          {participantList.map((participant) => (
            <div
              key={participant.sessionId}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Avatar className="w-10 h-10 border border-gray-600">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gray-600 text-white">
                  {participant.user_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium truncate">
                    {participant.user_name || "Participante"}
                  </p>
                  {participant.isTherapist && (
                    <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {/* Audio status */}
                  {participant.audio ? (
                    <Mic className="w-3 h-3 text-green-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}

                  {/* Video status */}
                  {participant.video ? (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-600 text-white">
                      Video
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-gray-500 text-gray-400">
                      Sem video
                    </Badge>
                  )}

                  {/* Screen sharing */}
                  {participant.screenVideo && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-600 text-white">
                      Compartilhando
                    </Badge>
                  )}

                  {/* Hand raised */}
                  {participant.handRaised && (
                    <Hand className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
