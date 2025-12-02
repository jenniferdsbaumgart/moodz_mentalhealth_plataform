"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"

interface AnnouncerStore {
  message: string
  announce: (message: string) => void
}

export const useAnnouncer = create<AnnouncerStore>((set) => ({
  message: "",
  announce: (message) => {
    set({ message: "" }) // Reset para re-anunciar mensagens iguais
    setTimeout(() => set({ message }), 100)
  },
}))

/**
 * Região de anúncios para leitores de tela.
 * Use o hook useAnnouncer().announce("mensagem") para anunciar.
 */
export function ScreenReaderAnnouncer() {
  const message = useAnnouncer((state) => state.message)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}


