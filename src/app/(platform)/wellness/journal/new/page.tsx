"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { JournalEditor } from "@/components/wellness/journal-editor"
import { Button } from "@/components/ui/button"
import { useCreateJournalEntry } from "@/hooks/use-wellness"
import { CreateJournalInput } from "@/lib/validations/journal"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewJournalPage() {
  const router = useRouter()
  const createEntry = useCreateJournalEntry()

  const handleSave = async (data: CreateJournalInput) => {
    try {
      await createEntry.mutateAsync(data)
      toast.success("Entrada do diário criada com sucesso!")
      router.push("/wellness/journal")
    } catch (error) {
      toast.error("Erro ao criar entrada do diário")
      throw error
    }
  }

  const handleAutoSave = async (data: Partial<CreateJournalInput>) => {
    // For now, we'll just store in localStorage
    // In a real app, you might want to save drafts to the server
    localStorage.setItem("journal-draft", JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    }))
  }

  return (
    <MainLayout>
      <div className="py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/wellness/journal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Diário
            </Link>
          </Button>
        </div>

        {/* Editor */}
        <JournalEditor
          onSave={handleSave}
          onAutoSave={handleAutoSave}
          isLoading={createEntry.isPending}
          autoSave={true}
        />
      </div>
    </MainLayout>
  )
}
