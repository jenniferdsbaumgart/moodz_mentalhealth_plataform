"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTherapistProfile } from "@/hooks/use-therapist-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Stethoscope, Settings, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TherapistProfileForm } from "@/components/therapist/profile-form"
import { SpecializationSelect } from "@/components/therapist/specialization-select"
import { DocumentUpload } from "@/components/therapist/document-upload"

export default function EditTherapistProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { profile, isLoading, error, updateProfile } = useTherapistProfile()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not therapist
  if (session && session.user?.role !== "THERAPIST") {
    router.push("/unauthorized")
    return null
  }

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        // Success - could show toast here
        console.log("Perfil atualizado com sucesso")
      }
    } catch (err) {
      console.error("Erro ao salvar:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertDescription>
          Erro ao carregar perfil: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/therapist/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações profissionais e configurações
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {profile && (
          <div className="flex gap-2">
            <Badge variant={profile.isVerified ? "default" : "secondary"}>
              {profile.isVerified ? "Verificado" : "Pendente de Verificação"}
            </Badge>
            <Badge variant={profile.availableForNew ? "default" : "outline"}>
              {profile.availableForNew ? "Aceitando Novos Pacientes" : "Lista de Espera"}
            </Badge>
          </div>
        )}

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Básico</span>
            </TabsTrigger>
            <TabsTrigger value="specialization" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Especialização</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Informações pessoais e profissionais básicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TherapistProfileForm
                    profile={profile}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specialization">
              <Card>
                <CardHeader>
                  <CardTitle>Especialização</CardTitle>
                  <CardDescription>
                    Suas especialidades e abordagens terapêuticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SpecializationSelect
                    profile={profile}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>
                    Preferências e configurações do seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Configurações adicionais serão implementadas aqui
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>
                    Upload de certificados e diplomas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload
                    profile={profile}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
