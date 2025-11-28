import { Role } from "@prisma/client"

export const ROLE_HIERARCHY: Record<Role, number> = {
  PATIENT: 1,
  THERAPIST: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
}

export const ROLE_LABELS: Record<Role, string> = {
  PATIENT: "Paciente",
  THERAPIST: "Terapeuta",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Super Admin",
}

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

