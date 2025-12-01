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

  // Construir filtros de data
  const where: any = {
    userId: session.user.id,
  }

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const entries = await db.moodEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  // Gerar CSV
  const headers = ["Data", "Hora", "Humor (1-10)", "Energia", "Notas", "Atividades"]

  const rows = entries.map((entry) => [
    format(entry.createdAt, "dd/MM/yyyy"),
    format(entry.createdAt, "HH:mm"),
    entry.mood.toString(),
    entry.energy?.toString() || "",
    `"${(entry.notes || "").replace(/"/g, '""')}"`, // Escapar aspas
    entry.activities?.join("; ") || "",
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  // Adicionar BOM para Excel reconhecer UTF-8
  const bom = "\uFEFF"
  const csvWithBom = bom + csv

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="moodz-humor-${format(new Date(), "yyyy-MM-dd")}.csv"`,
    },
  })
}

