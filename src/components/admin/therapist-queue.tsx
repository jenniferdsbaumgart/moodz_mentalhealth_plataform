"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, FileText, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function TherapistQueue() {
  const queryClient = useQueryClient()
  const [rejectReason, setRejectReason] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "therapists", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/therapists?status=pending")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    }
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/therapists/${id}/approve`, {
        method: "POST"
      })
      if (!res.ok) throw new Error("Failed to approve")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] })
      toast.success("Terapeuta aprovado com sucesso!")
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/therapists/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) throw new Error("Failed to reject")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "therapists"] })
      toast.success("Terapeuta rejeitado")
      setSelectedId(null)
      setRejectReason("")
    }
  })

  if (isLoading) return <div>Carregando...</div>

  if (!data?.therapists?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Check className="h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-medium">Nenhum terapeuta pendente</p>
          <p className="text-muted-foreground">
            Todos os terapeutas foram revisados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.therapists.map((therapist: any) => (
        <Card key={therapist.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={therapist.user.image} />
                <AvatarFallback>
                  {therapist.user.name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{therapist.user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {therapist.user.email}
                </p>
                <Badge className="mt-1">{therapist.specialization}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">CRP</p>
              <p className="text-sm text-muted-foreground">{therapist.crp}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Bio</p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {therapist.bio}
              </p>
            </div>
            {therapist.documentUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={therapist.documentUrl} target="_blank" rel="noopener">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver documento
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              className="flex-1"
              onClick={() => approveMutation.mutate(therapist.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedId(therapist.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeitar terapeuta</DialogTitle>
                  <DialogDescription>
                    Informe o motivo da rejeição. O terapeuta receberá um email.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Motivo da rejeição..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedId) {
                        rejectMutation.mutate({
                          id: selectedId,
                          reason: rejectReason
                        })
                      }
                    }}
                    disabled={!rejectReason || rejectMutation.isPending}
                  >
                    Confirmar rejeição
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

