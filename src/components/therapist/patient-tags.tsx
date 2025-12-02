"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Tag,
  Plus,
  X,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  Heart,
  Brain,
  Zap,
} from "lucide-react"

interface PatientTagsProps {
  patientId: string
}

interface PatientTag {
  id: string
  name: string
  color: string
  category: string
  createdAt: Date
}

// Tags sugeridas por categoria
const SUGGESTED_TAGS = {
  "Sintomas": [
    { name: "Ansiedade", color: "bg-red-100 text-red-800", icon: Brain },
    { name: "Depressão", color: "bg-blue-100 text-blue-800", icon: Heart },
    { name: "Estresse", color: "bg-yellow-100 text-yellow-800", icon: Zap },
    { name: "Insônia", color: "bg-purple-100 text-purple-800", icon: Users },
    { name: "Trauma", color: "bg-pink-100 text-pink-800", icon: Heart },
  ],
  "Comportamento": [
    { name: "Motivado", color: "bg-green-100 text-green-800", icon: TrendingUp },
    { name: "Resistente", color: "bg-orange-100 text-orange-800", icon: Users },
    { name: "Comprometido", color: "bg-teal-100 text-teal-800", icon: Calendar },
    { name: "Inconstante", color: "bg-gray-100 text-gray-800", icon: TrendingUp },
  ],
  "Progresso": [
    { name: "Melhorando", color: "bg-emerald-100 text-emerald-800", icon: TrendingUp },
    { name: "Estável", color: "bg-cyan-100 text-cyan-800", icon: Users },
    { name: "Recaindo", color: "bg-rose-100 text-rose-800", icon: Heart },
    { name: "Recuperado", color: "bg-lime-100 text-lime-800", icon: Brain },
  ],
  "Preferências": [
    { name: "TCC", color: "bg-indigo-100 text-indigo-800", icon: Brain },
    { name: "Psicanálise", color: "bg-violet-100 text-violet-800", icon: Heart },
    { name: "Mindfulness", color: "bg-sky-100 text-sky-800", icon: Zap },
    { name: "Grupo", color: "bg-amber-100 text-amber-800", icon: Users },
  ],
}

export function PatientTags({ patientId }: PatientTagsProps) {
  const [newTagName, setNewTagName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState("bg-gray-100 text-gray-800")

  const queryClient = useQueryClient()

  const { data: tagsData, isLoading } = useQuery({
    queryKey: ["therapist", "patient", patientId, "tags"],
    queryFn: async () => {
      // Mock data - em produção, buscar da API
      return {
        data: [
          {
            id: "1",
            name: "Ansiedade",
            color: "bg-red-100 text-red-800",
            category: "Sintomas",
            createdAt: new Date("2024-01-10"),
          },
          {
            id: "2",
            name: "Motivado",
            color: "bg-green-100 text-green-800",
            category: "Comportamento",
            createdAt: new Date("2024-01-12"),
          },
          {
            id: "3",
            name: "TCC",
            color: "bg-indigo-100 text-indigo-800",
            category: "Preferências",
            createdAt: new Date("2024-01-15"),
          },
        ],
      }
    },
  })

  const addTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; category: string }) => {
      // Mock - em produção, fazer chamada para API
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true, data: { id: Date.now().toString(), ...data, createdAt: new Date() } }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "patient", patientId, "tags"]
      })
      setNewTagName("")
      setSelectedCategory("")
      setSelectedColor("bg-gray-100 text-gray-800")
    },
  })

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      // Mock - em produção, fazer chamada para API
      await new Promise(resolve => setTimeout(resolve, 300))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "patient", patientId, "tags"]
      })
    },
  })

  const tags: PatientTag[] = tagsData?.data || []

  const handleAddTag = () => {
    if (!newTagName.trim() || !selectedCategory) return

    addTagMutation.mutate({
      name: newTagName.trim(),
      color: selectedColor,
      category: selectedCategory,
    })
  }

  const handleAddSuggestedTag = (tag: typeof SUGGESTED_TAGS[string][number]) => {
    addTagMutation.mutate({
      name: tag.name,
      color: tag.color,
      category: Object.keys(SUGGESTED_TAGS).find(cat =>
        SUGGESTED_TAGS[cat as keyof typeof SUGGESTED_TAGS].some(t => t.name === tag.name)
      ) || "Personalizado",
    })
  }

  const colorOptions = [
    "bg-gray-100 text-gray-800",
    "bg-red-100 text-red-800",
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tags Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags do Paciente ({tags.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma tag ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione tags para organizar e categorizar o paciente
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={`${tag.color} flex items-center gap-1`}
                >
                  {tag.name}
                  <button
                    onClick={() => removeTagMutation.mutate(tag.id)}
                    className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar Tag Personalizada */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Tag Personalizada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nome da Tag</Label>
              <Input
                id="tag-name"
                placeholder="Ex: Ansiedade Social"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(SUGGESTED_TAGS).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${color} ${
                    selectedColor === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddTag}
            disabled={!newTagName.trim() || !selectedCategory || addTagMutation.isPending}
          >
            {addTagMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tag
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tags Sugeridas */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Sugeridas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(SUGGESTED_TAGS).map(([category, tags]) => (
            <div key={category}>
              <h4 className="font-medium mb-3">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const IconComponent = tag.icon
                  const isAlreadyAdded = tags.some(t =>
                    t.name === tag.name && t.color === tag.color
                  )

                  return (
                    <Button
                      key={tag.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSuggestedTag(tag)}
                      disabled={isAlreadyAdded || addTagMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <IconComponent className="h-3 w-3" />
                      {tag.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Informações sobre tags */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Sobre Tags</h4>
              <p className="text-sm text-blue-700 mt-1">
                Use tags para categorizar pacientes por sintomas, comportamento, progresso
                e preferências terapêuticas. Isso ajuda na organização e análise de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

