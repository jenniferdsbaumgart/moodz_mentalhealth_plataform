"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  Bell,
  Key,
  Loader2,
  MessageSquare,
  Trophy,
  AlertTriangle,
  Activity,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { UserActivityTimeline } from "./user-activity-timeline"

interface UserDetailModalProps {
  userId: string | null
  onClose: () => void
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const queryClient = useQueryClient()
  const [actionDialog, setActionDialog] = useState<string | null>(null)
  const [actionReason, setActionReason] = useState("")
  const [newRole, setNewRole] = useState("")
  const [suspendDays, setSuspendDays] = useState("7")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/activity`)
      if (!response.ok) throw new Error("Failed to fetch user details")
      return response.json()
    },
    enabled: !!userId
  })

  const roleMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, reason: actionReason })
      })
      if (!response.ok) throw new Error("Failed to change role")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("Função alterada com sucesso")
      setActionDialog(null)
      setActionReason("")
    },
    onError: () => toast.error("Erro ao alterar função")
  })

  const suspendMutation = useMutation({
    mutationFn: async (params: { type: string; duration?: number; reason?: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      })
      if (!response.ok) throw new Error("Failed to suspend user")
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success(`Usuário ${data.action === "unban" ? "reativado" : "suspenso"} com sucesso`)
      setActionDialog(null)
      setActionReason("")
    },
    onError: () => toast.error("Erro na operação")
  })

  if (!userId) return null

  const user = data?.user
  const stats = data?.stats
  const activity = data?.activity
  const timeline = data?.timeline

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      SUSPENDED: "outline",
      BANNED: "destructive"
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-800",
      THERAPIST: "bg-blue-100 text-blue-800",
      PATIENT: "bg-green-100 text-green-800"
    }
    return (
      <Badge className={colors[role] || ""} variant="outline">
        {role}
      </Badge>
    )
  }

  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Erro ao carregar dados do usuário
          </div>
        ) : user ? (
          <div className="flex-1 overflow-hidden">
            {/* User Header */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{user.name || "Sem nome"}</h3>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Cadastrado em {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionDialog("role")}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Função
                </Button>
                {user.status === "ACTIVE" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionDialog("suspend")}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Suspender
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => suspendMutation.mutate({ type: "unban" })}
                  >
                    Reativar
                  </Button>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-4 gap-4 py-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{stats.totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Activity className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessões</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-2xl font-bold">{stats.badgesEarned}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                    <p className="text-2xl font-bold">{stats.reportsReceived}</p>
                    <p className="text-xs text-muted-foreground">Reports</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="timeline" className="flex-1">
              <TabsList>
                <TabsTrigger value="timeline">Atividade</TabsTrigger>
                <TabsTrigger value="posts">Posts ({activity?.posts?.length || 0})</TabsTrigger>
                <TabsTrigger value="sessions">Sessões ({activity?.sessions?.length || 0})</TabsTrigger>
                <TabsTrigger value="badges">Badges ({activity?.badges?.length || 0})</TabsTrigger>
                <TabsTrigger value="reports">Reports ({stats?.reportsReceived || 0})</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[300px] mt-4">
                <TabsContent value="timeline">
                  <UserActivityTimeline timeline={timeline || []} />
                </TabsContent>

                <TabsContent value="posts">
                  <div className="space-y-2">
                    {activity?.posts?.map((post: any) => (
                      <div key={post.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{post.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{post.category}</Badge>
                          <span>{post._count.comments} comentários</span>
                          <span>{post._count.votes} votos</span>
                          <span>{format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                    ))}
                    {!activity?.posts?.length && (
                      <p className="text-center text-muted-foreground py-4">Nenhum post</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sessions">
                  <div className="space-y-2">
                    {activity?.sessions?.map((session: any) => (
                      <div key={session.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{session.session.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{session.session.category}</Badge>
                          <Badge variant={session.session.status === "COMPLETED" ? "default" : "secondary"}>
                            {session.session.status}
                          </Badge>
                          <span>{format(new Date(session.joinedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        </div>
                      </div>
                    ))}
                    {!activity?.sessions?.length && (
                      <p className="text-center text-muted-foreground py-4">Nenhuma sessão</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="badges">
                  <div className="grid grid-cols-3 gap-2">
                    {activity?.badges?.map((badge: any) => (
                      <div key={badge.id} className="p-3 border rounded-lg text-center">
                        <span className="text-2xl">{badge.badge.icon || "🏆"}</span>
                        <p className="font-medium text-sm">{badge.badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(badge.earnedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                    {!activity?.badges?.length && (
                      <p className="col-span-3 text-center text-muted-foreground py-4">Nenhum badge</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <div className="space-y-2">
                    {activity?.reportsReceived?.map((report: any) => (
                      <div key={report.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === "RESOLVED" ? "default" : "destructive"}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">{report.contentType}</Badge>
                        </div>
                        <p className="text-sm mt-1">{report.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                    {!activity?.reportsReceived?.length && (
                      <p className="text-center text-muted-foreground py-4">Nenhum report</p>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : null}

        {/* Action Dialogs */}
        {actionDialog === "role" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Alterar Função</h4>
            <div className="space-y-3">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Paciente</SelectItem>
                  <SelectItem value="THERAPIST">Terapeuta</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Motivo (opcional)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActionDialog(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => roleMutation.mutate(newRole)}
                  disabled={!newRole || roleMutation.isPending}
                >
                  {roleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Alterar
                </Button>
              </div>
            </div>
          </div>
        )}

        {actionDialog === "suspend" && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Suspender Usuário</h4>
            <div className="space-y-3">
              <Select value={suspendDays} onValueChange={setSuspendDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="permanent">Banir permanentemente</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Motivo (opcional)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActionDialog(null)}>
                  Cancelar
                </Button>
                <Button
                  variant={suspendDays === "permanent" ? "destructive" : "default"}
                  onClick={() => suspendMutation.mutate({
                    type: suspendDays === "permanent" ? "ban" : "suspend",
                    duration: suspendDays !== "permanent" ? parseInt(suspendDays) : undefined,
                    reason: actionReason
                  })}
                  disabled={suspendMutation.isPending}
                >
                  {suspendMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {suspendDays === "permanent" ? "Banir" : "Suspender"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

