import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { format } from "date-fns"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const where: any = {
    userId: session.user.id,
  }

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const entries = await db.journalEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Gerar CSV
  const headers = ["Data", "Hora", "Título", "Conteúdo", "Humor", "Tags"]

  const rows = entries.map((entry) => [
    format(entry.createdAt, "dd/MM/yyyy"),
    format(entry.createdAt, "HH:mm"),
    `"${(entry.title || "Sem título").replace(/"/g, '""')}"`,
    `"${stripHtml(entry.content).replace(/"/g, '""')}"`,
    entry.mood?.toString() || "",
    entry.tags?.join("; ") || "",
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  const bom = "\uFEFF"
  const csvWithBom = bom + csv

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="moodz-diario-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  })
}

// Helper para remover HTML do conteúdo do journal
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove tags
    .replace(/&nbsp;/g, " ") // Substitui &nbsp;
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n+/g, " ") // Remove quebras de linha extras
    .trim()
}


