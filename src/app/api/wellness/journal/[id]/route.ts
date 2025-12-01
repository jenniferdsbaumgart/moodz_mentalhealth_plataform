import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateJournalSchema } from "@/lib/validations/journal"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Get journal entry
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        patientId: patient.id,
      },
      include: {
        prompt: true,
      },
    })

    if (!journalEntry) {
      return NextResponse.json(
        { error: "Entrada do diário não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: journalEntry })
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateJournalSchema.parse(body)

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        patientId: patient.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entrada do diário não encontrada" },
        { status: 404 }
      )
    }

    // Update journal entry
    const journalEntry = await prisma.journalEntry.update({
      where: { id },
      data: validatedData,
      include: {
        prompt: true,
      },
    })

    return NextResponse.json({
      data: journalEntry,
      message: "Entrada do diário atualizada com sucesso!"
    })
  } catch (error) {
    console.error("Error updating journal entry:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = params

    // Get patient profile
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Perfil do paciente não encontrado" },
        { status: 404 }
      )
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        patientId: patient.id,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entrada do diário não encontrada" },
        { status: 404 }
      )
    }

    // Delete journal entry
    await prisma.journalEntry.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Entrada do diário excluída com sucesso!"
    })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


