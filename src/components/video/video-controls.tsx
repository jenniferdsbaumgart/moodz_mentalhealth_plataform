"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Settings
} from "lucide-react"

interface VideoControlsProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  isTherapist?: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onLeave: () => void
  onSettings?: () => void
}

export function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isTherapist = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
  onSettings
}: VideoControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-4 p-6 bg-gray-900 border-t border-gray-700">
        {/* Audio Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={onToggleAudio}
              className="rounded-full w-12 h-12"
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAudioEnabled ? "Desligar microfone" : "Ligar microfone"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Video Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={onToggleVideo}
              className="rounded-full w-12 h-12"
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoEnabled ? "Desligar câmera" : "Ligar câmera"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Screen Share (Therapist only) */}
        {isTherapist && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="lg"
                onClick={onToggleScreenShare}
                className="rounded-full w-12 h-12"
              >
                <Monitor className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isScreenSharing ? "Parar compartilhamento" : "Compartilhar tela"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Settings */}
        {onSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={onSettings}
                className="rounded-full w-12 h-12"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Spacer */}
        <div className="w-8" />

        {/* Leave Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeave}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sair da chamada</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
