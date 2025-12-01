import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit/service"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"

const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

// GET - Listar admins
export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(admins)
}

// POST - Criar novo admin
export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email, name } = createAdminSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Se usuário existe, apenas promover para admin
      if (existingUser.role === "ADMIN" || existingUser.role === "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Este usuário já é um administrador" },
          { status: 400 }
        )
      }

      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: { role: "ADMIN" },
      })

      await createAuditLog({
        userId: session.user.id,
        action: "ADMIN_CREATED",
        entity: "User",
        entityId: updatedUser.id,
        details: {
          method: "promotion",
          previousRole: existingUser.role,
          email,
        },
      })

      return NextResponse.json(updatedUser)
    }

    // Criar novo usuário admin com senha temporária
    const tempPassword = randomBytes(16).toString("hex")
    const hashedPassword = await hash(tempPassword, 12)

    const newAdmin = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
        status: "PENDING", // Aguardando primeiro login
        profile: {
          create: {
            displayName: name,
          },
        },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "ADMIN_CREATED",
      entity: "User",
      entityId: newAdmin.id,
      details: {
        method: "creation",
        email,
      },
    })

    // TODO: Enviar email de convite com link para definir senha
    // await sendAdminInviteEmail(email, tempPassword)

    return NextResponse.json(newAdmin, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar admin:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

