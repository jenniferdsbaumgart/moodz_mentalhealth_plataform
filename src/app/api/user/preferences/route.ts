import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userPreferencesSchema, updateUserPreferencesSchema } from "@/lib/validations/user"
import { ApiResponse, UserPreferences } from "@/types/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    let preferences = await db.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.userPreferences.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          pushNotifications: true,
          sessionReminders: true,
          communityNotifications: true,
          profileVisibility: "private",
          showMoodInCommunity: false,
          theme: "system",
          language: "pt-BR",
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    } as ApiResponse<UserPreferences>)
  } catch (error) {
    console.error("Erro ao buscar preferências:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = userPreferencesSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          error: validationResult.error.issues,
        } as ApiResponse,
        { status: 400 }
      )
    }

    // Check if preferences already exist
    const existingPreferences = await db.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    if (existingPreferences) {
      return NextResponse.json(
        { success: false, message: "Preferências já existem" } as ApiResponse,
        { status: 409 }
      )
    }

    // Create preferences
    const preferences = await db.userPreferences.create({
      data: {
        userId: session.user.id,
        ...validationResult.data,
      },
    })

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Preferências criadas com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao criar preferências:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" } as ApiResponse,
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = updateUserPreferencesSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados inválidos",
          error: validationResult.error.issues,
        } as ApiResponse,
        { status: 400 }
      )
    }

    // Update or create preferences
    const preferences = await db.userPreferences.upsert({
      where: { userId: session.user.id },
      update: validationResult.data,
      create: {
        userId: session.user.id,
        emailNotifications: true,
        pushNotifications: true,
        sessionReminders: true,
        communityNotifications: true,
        profileVisibility: "private",
        showMoodInCommunity: false,
        theme: "system",
        language: "pt-BR",
        ...validationResult.data,
      },
    })

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Preferências atualizadas com sucesso",
    } as ApiResponse)
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    )
  }
}
