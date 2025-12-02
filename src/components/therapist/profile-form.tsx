"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, User } from "lucide-react"
import { TherapistProfile } from "@/types/user"

const profileFormSchema = z.object({
  crp: z.string().min(1, "CRP é obrigatório"),
  bio: z.string().min(100, "Biografia deve ter pelo menos 100 caracteres").max(2000, "Biografia deve ter no máximo 2000 caracteres"),
  education: z.string().optional(),
  experience: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  publicBio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

interface TherapistProfileFormProps {
  profile: TherapistProfile | null
  onSave: (data: Partial<TherapistProfile>) => Promise<void>
  isSaving: boolean
}

export function TherapistProfileForm({
  profile,
  onSave,
  isSaving,
}: TherapistProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      crp: profile?.crp || "",
      bio: profile?.bio || "",
      education: profile?.education || "",
      experience: profile?.experience || "",
      photoUrl: profile?.photoUrl || "",
      publicBio: profile?.publicBio || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    await onSave(data)
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Simular upload - em produção, isso seria enviado para uma API
      const formData = new FormData()
      formData.append("file", file)

      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock URL
      const mockUrl = `https://example.com/uploads/${file.name}`
      form.setValue("photoUrl", mockUrl)

      console.log("Foto uploaded:", mockUrl)
    } catch (error) {
      console.error("Erro no upload:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Foto do Perfil */}
      <div className="space-y-4">
        <Label>Foto do Perfil</Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              {form.watch("photoUrl") ? (
                <img
                  src={form.watch("photoUrl")}
                  alt="Foto do perfil"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={isUploading}
            />
            <Label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Enviando..." : "Alterar Foto"}
                </span>
              </Button>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG ou GIF. Máx. 5MB
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photoUrl">URL da Foto (opcional)</Label>
          <Input
            id="photoUrl"
            placeholder="https://..."
            {...form.register("photoUrl")}
          />
        </div>
      </div>

      {/* CRP */}
      <div className="space-y-2">
        <Label htmlFor="crp">CRP *</Label>
        <Input
          id="crp"
          placeholder="Ex: 12/34567"
          {...form.register("crp")}
        />
        {form.formState.errors.crp && (
          <p className="text-sm text-red-500">
            {form.formState.errors.crp.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Biografia Profissional *</Label>
        <Textarea
          id="bio"
          placeholder="Descreva sua experiência, abordagem terapêutica, especialidades..."
          className="min-h-[120px]"
          {...form.register("bio")}
        />
        <p className="text-sm text-muted-foreground">
          Mínimo 100 caracteres, máximo 2000 caracteres
        </p>
        {form.formState.errors.bio && (
          <p className="text-sm text-red-500">
            {form.formState.errors.bio.message}
          </p>
        )}
      </div>

      {/* Bio Pública */}
      <div className="space-y-2">
        <Label htmlFor="publicBio">Biografia Pública (opcional)</Label>
        <Textarea
          id="publicBio"
          placeholder="Versão resumida da sua biografia para o perfil público..."
          className="min-h-[80px]"
          {...form.register("publicBio")}
        />
        <p className="text-sm text-muted-foreground">
          Se não preenchida, será usada a biografia profissional
        </p>
      </div>

      {/* Formação e Experiência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education">Formação Acadêmica</Label>
          <Textarea
            id="education"
            placeholder="Ex: Psicologia - USP (2010-2015)"
            className="min-h-[80px]"
            {...form.register("education")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experiência Profissional</Label>
          <Textarea
            id="experience"
            placeholder="Descreva sua experiência profissional..."
            className="min-h-[80px]"
            {...form.register("experience")}
          />
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </form>
  )
}

