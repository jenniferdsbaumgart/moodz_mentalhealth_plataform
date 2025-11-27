"use client"

import React, { useState } from "react"
import { useUserProfile } from "@/hooks/use-user-profile"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Edit, Save, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserProfileSchema, type UpdateUserProfileInput } from "@/lib/validations/user"

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.profile?.bio || "",
      avatar: profile?.profile?.avatar || "",
      phone: profile?.profile?.phone || "",
      birthDate: profile?.profile?.birthDate
        ? new Date(profile.profile.birthDate).toISOString().split('T')[0]
        : "",
    },
  })

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        bio: profile.profile?.bio || "",
        avatar: profile.profile?.avatar || "",
        phone: profile.profile?.phone || "",
        birthDate: profile.profile?.birthDate
          ? new Date(profile.profile.birthDate).toISOString().split('T')[0]
          : "",
      })
    }
  }, [profile, form])

  const onSubmit = async (data: UpdateUserProfileInput) => {
    setIsSaving(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        setIsEditing(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Suas informações básicas de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.profile?.avatar || profile?.image || ""} />
                <AvatarFallback className="text-lg">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile?.name}</h3>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      {...form.register("name")}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.name || "Não informado"}
                    </p>
                  )}
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      {...form.register("phone")}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.profile?.phone || "Não informado"}
                    </p>
                  )}
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      {...form.register("birthDate")}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md">
                      {profile?.profile?.birthDate
                        ? new Date(profile.profile.birthDate).toLocaleDateString("pt-BR")
                        : "Não informado"}
                    </p>
                  )}
                  {form.formState.errors.birthDate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.birthDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">URL do Avatar</Label>
                  {isEditing ? (
                    <Input
                      id="avatar"
                      placeholder="https://..."
                      {...form.register("avatar")}
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted rounded-md truncate">
                      {profile?.profile?.avatar || "Não informado"}
                    </p>
                  )}
                  {form.formState.errors.avatar && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.avatar.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    className="min-h-[100px]"
                    {...form.register("bio")}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md min-h-[100px]">
                    {profile?.profile?.bio || "Nenhuma biografia adicionada"}
                  </p>
                )}
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
