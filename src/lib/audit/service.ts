import { db } from "@/lib/db"
import { AuditAction } from "@prisma/client"
import { headers } from "next/headers"

interface AuditLogInput {
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function createAuditLog(input: AuditLogInput) {
  const headersList = await headers()
  const ipAddress = headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown"
  const userAgent = headersList.get("user-agent") || undefined

  return db.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      details: input.details as any,
      ipAddress,
      userAgent,
    },
  })
}

// Helper para usar em API routes
export async function withAuditLog<T>(
  input: AuditLogInput,
  operation: () => Promise<T>
): Promise<T> {
  const result = await operation()
  await createAuditLog(input)
  return result
}


