"use client"

import { PostForm } from "@/components/admin/blog/post-form"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function NewTherapistPostPage() {
  return (
    <DashboardShell
      title="Novo Post"
      description="Crie um novo artigo para o blog"
    >
      <PostForm />
    </DashboardShell>
  )
}

