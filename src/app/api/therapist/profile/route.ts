import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db as prisma } from "@/lib/db"
import { z } from "zod"
const updateProfileSchema = z.object({
  crp: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  publicBio: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  sessionPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  availableForNew: z.boolean().optional(),
})
// GET - Buscar perfil do terapeuta
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        stats: true,
        availabilities: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
        reviews: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            patient: {
              select: {
                name: true,
              },
            },
            session: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })
    if (!therapistProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil não encontrado" },
        { status: 404 }
      )
    }
    return NextResponse.json({
      success: true,
      data: therapistProfile,
    })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// PATCH - Atualizar perfil do terapeuta
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    // Verificar se o perfil existe
    const existingProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil não encontrado" },
        { status: 404 }
      )
    }
    // Atualizar o perfil
    const updatedProfile = await prisma.therapistProfile.update({
      where: {
        userId: session.user.id,
      },
      data: validatedData,
    })
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Perfil atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
// POST - Criar perfil do terapeuta (para onboarding)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "THERAPIST") {
      return NextResponse.json(
        { success: false, message: "Acesso negado" },
        { status: 403 }
      )
    }
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    // Verificar se já existe um perfil
    const existingProfile = await prisma.therapistProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })
    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: "Perfil já existe" },
        { status: 409 }
      )
    }
    // Criar o perfil
    const newProfile = await prisma.therapistProfile.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        crp: validatedData.crp || "",
        bio: validatedData.bio || "",
        specialties: validatedData.specialties || [],
        specializations: validatedData.specializations || [],
        languages: validatedData.languages || [],
      },
    })
    return NextResponse.json({
      success: true,
      data: newProfile,
      message: "Perfil criado com sucesso",
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar perfil:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          errors: error.issues,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
