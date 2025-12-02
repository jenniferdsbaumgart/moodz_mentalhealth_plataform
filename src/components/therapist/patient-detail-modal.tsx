"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Calendar,
  MessageSquare,
  FileText,
  Tag,
  Loader2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { PatientNotes } from "./patient-notes"
import { PatientSessionHistory } from "./patient-session-history"
import { PatientTags } from "./patient-tags"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PatientDetailModalProps {
  patientId: string
  isOpen: boolean
  onClose: () => void
}

export function PatientDetailModal({
  patientId,
  isOpen,
  onClose,
}: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const { data: patientData, isLoading } = useQuery({
    queryKey: ["therapist", "patient", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/therapist/patients/${patientId}`)
      if (!res.ok) throw new Error("Failed to fetch patient details")
      return res.json()
    },
    enabled: isOpen && !!patientId,
  })

  const patient = patientData?.data

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={patient?.image} />
              <AvatarFallback>
                {patient?.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {patient?.name || "Paciente"}
                {patient?.isActive && (
                  <Badge variant="default" className="text-xs">
                    Ativo
                  </Badge>
                )}
              </div>
              <DialogDescription>
                Detalhes completos do paciente
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : patient ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Sessões
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notas
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Nome</label>
                          <p className="text-sm text-muted-foreground">
                            {patient.name || "Não informado"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {patient.email}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Telefone</label>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {patient.phone || "Não informado"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Data de Nascimento</label>
                          <p className="text-sm text-muted-foreground">
                            {patient.birthDate
                              ? format(new Date(patient.birthDate), "dd/MM/yyyy", { locale: ptBR })
                              : "Não informado"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estatísticas */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {patient.totalSessions || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessões totais
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {patient.completedSessions || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Sessões completadas
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {patient.avgRating || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avaliação média
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {patient.daysSinceLastSession || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Dias desde última sessão
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preferências */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferências</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Categorias de Interesse</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {patient.preferredCategories?.length > 0 ? (
                              patient.preferredCategories.map((category: string) => (
                                <Badge key={category} variant="outline">
                                  {category}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Nenhuma categoria definida
                              </span>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <label className="text-sm font-medium">Preferências de Comunicação</label>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <span className="font-medium">Notificações por email:</span>{" "}
                              {patient.emailNotifications ? "Sim" : "Não"}
                            </div>
                            <div>
                              <span className="font-medium">Lembretes de sessão:</span>{" "}
                              {patient.sessionReminders ? "Sim" : "Não"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sessions">
                <PatientSessionHistory patientId={patientId} />
              </TabsContent>

              <TabsContent value="notes">
                <PatientNotes patientId={patientId} />
              </TabsContent>

              <TabsContent value="tags">
                <PatientTags patientId={patientId} />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Paciente não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

