"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { PostsTable } from "@/components/admin/blog/posts-table"
import { PostsFilters } from "@/components/admin/blog/posts-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function TherapistBlogPage() {
  return (
    <DashboardShell
      title="Meus Posts"
      description="Gerencie seus artigos do blog"
      action={
        <Button asChild>
          <Link href="/therapist/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <PostsFilters />
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PostsTable />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

