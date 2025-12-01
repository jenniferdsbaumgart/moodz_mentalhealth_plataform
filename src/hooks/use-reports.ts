"use client"

import { useMutation } from "@tanstack/react-query"
import { CreateReportInput } from "@/lib/validations/community"
import { toast } from "sonner"

export function useCreateReport() {
  return useMutation({
    mutationFn: async (data: CreateReportInput) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao enviar denúncia")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Denúncia enviada com sucesso! Nossa equipe irá analisar.")
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar denúncia")
    },
  })
}


