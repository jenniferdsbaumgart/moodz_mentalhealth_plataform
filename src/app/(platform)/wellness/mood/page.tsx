"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { MoodInput } from "@/components/wellness/mood-input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MoodPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/wellness")
  }

  return (
    <MainLayout>
      <div className="py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/wellness">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Bem-estar
            </Link>
          </Button>
        </div>

        <MoodInput onSuccess={handleSuccess} />
      </div>
    </MainLayout>
  )
}
