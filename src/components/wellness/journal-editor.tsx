"use client"

import { useEffect, useState, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import CodeBlock from "@tiptap/extension-code-block"
import Blockquote from "@tiptap/extension-blockquote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodSlider } from "./mood-slider"
import { JournalPrompts } from "./journal-prompts"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  Clock,
  Hash,
  Sparkles,
  X
} from "lucide-react"
import { CreateJournalInput, JournalPromptCategory } from "@/lib/validations/journal"

interface JournalEditorProps {
  initialData?: Partial<CreateJournalInput>
  onSave: (data: CreateJournalInput) => Promise<void>
  onAutoSave?: (data: Partial<CreateJournalInput>) => Promise<void>
  isLoading?: boolean
  autoSave?: boolean
}

export function JournalEditor({
  initialData,
  onSave,
  onAutoSave,
  isLoading = false,
  autoSave = true
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [mood, setMood] = useState(initialData?.mood || 5)
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [promptCategory, setPromptCategory] = useState<JournalPromptCategory | null>(null)
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate ?? true)
  const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite ?? false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Comece a escrever seus pensamentos...",
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      CodeBlock,
      Blockquote,
    ],
    content: initialData?.content || "",
    onUpdate: () => {
      if (autoSave) {
        handleAutoSave()
      }
    },
  })

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!onAutoSave || !editor) return

    try {
      await onAutoSave({
        title: title || "Rascunho sem título",
        content: editor.getHTML(),
        mood,
        tags,
        isPrivate,
        isFavorite,
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [title, editor, mood, tags, isPrivate, isFavorite, onAutoSave])

  // Auto-save timer
  useEffect(() => {
    if (!autoSave) return

    const timer = setInterval(() => {
      handleAutoSave()
    }, 30000) // 30 seconds

    return () => clearInterval(timer)
  }, [handleAutoSave, autoSave])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSelectPrompt = (prompt: string, category: JournalPromptCategory) => {
    setSelectedPrompt(prompt)
    setPromptCategory(category)
    if (editor) {
      editor.commands.setContent(`<h2>${prompt}</h2><p></p>`)
    }
  }

  const handleSave = async () => {
    if (!editor || !title.trim()) return

    const data: CreateJournalInput = {
      title: title.trim(),
      content: editor.getHTML(),
      mood,
      tags,
      isPrivate,
      isFavorite,
      promptId: selectedPrompt ? "custom" : undefined, // We'll handle prompts differently
    }

    await onSave(data)
  }

  const wordCount = editor?.storage.characterCount?.words() || 0
  const characterCount = editor?.storage.characterCount?.characters() || 0
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed

  if (!editor) {
    return <div>Carregando editor...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo Diário</h1>
          <p className="text-muted-foreground">Escreva seus pensamentos e reflexões</p>
        </div>
        {lastSaved && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Salvo automaticamente às {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write">Escrever</TabsTrigger>
          <TabsTrigger value="mood">Humor</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>

        {/* Write Tab */}
        <TabsContent value="write" className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título *
            </label>
            <Input
              id="title"
              placeholder="Dê um título para sua entrada..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Selected Prompt */}
          {selectedPrompt && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Prompt selecionado:</p>
                    <p className="text-sm text-muted-foreground">{selectedPrompt}</p>
                    {promptCategory && (
                      <Badge variant="outline" className="mt-2">
                        {promptCategory}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPrompt(null)
                      setPromptCategory(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editor Toolbar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1 mb-3">
                <Button
                  variant={editor.isActive("bold") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("italic") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("strike") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("code") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                >
                  <Code className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <Button
                  variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <Button
                  variant={editor.isActive("bulletList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("orderedList") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("blockquote") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <Button
                  variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-6" />

                <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()}>
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              {/* Editor */}
              <div className="min-h-[300px] border rounded-md p-4 focus-within:ring-2 focus-within:ring-ring">
                <EditorContent editor={editor} className="prose prose-sm max-w-none" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-3 pt-3 border-t">
                <div className="flex gap-4">
                  <span>{characterCount}/10.000 caracteres</span>
                  <span>{wordCount} palavras</span>
                  <span>~{readingTime} min de leitura</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tags
              </CardTitle>
              <CardDescription>
                Adicione tags para organizar suas entradas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1"
                />
                <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                  Adicionar
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTag(tag)}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Privado</label>
                  <p className="text-sm text-muted-foreground">
                    Apenas você pode ver esta entrada
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Favorito</label>
                  <p className="text-sm text-muted-foreground">
                    Destaque esta entrada como favorita
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
              size="lg"
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Diário
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como você está se sentindo?</CardTitle>
              <CardDescription>
                Associe um humor à sua entrada (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSlider
                value={mood}
                onChange={setMood}
                label="Selecione seu humor atual"
                showLabels={true}
                size="lg"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <JournalPrompts onSelectPrompt={handleSelectPrompt} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
