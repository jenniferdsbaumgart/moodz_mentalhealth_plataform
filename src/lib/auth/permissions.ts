import { Role } from "@prisma/client"

export const PERMISSIONS = {
  // User management
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Therapist management
  THERAPIST_VERIFY: "therapist:verify",
  THERAPIST_VIEW_ALL: "therapist:view_all",
  THERAPIST_MANAGE: "therapist:manage",

  // Session management
  SESSION_CREATE: "session:create",
  SESSION_JOIN: "session:join",
  SESSION_MANAGE: "session:manage",

  // Community management
  POST_CREATE: "post:create",
  POST_MODERATE: "post:moderate",
  COMMUNITY_MANAGE: "community:manage",

  // Content management
  BLOG_MANAGE: "blog:manage",
  CONTENT_PUBLISH: "content:publish",

  // System administration
  SYSTEM_CONFIG: "system:config",
  AUDIT_VIEW: "audit:view",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  PATIENT: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.SESSION_JOIN,
  ],
  THERAPIST: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.SESSION_CREATE,
    PERMISSIONS.SESSION_MANAGE,
    PERMISSIONS.USER_VIEW, // view their own patients
  ],
  ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.THERAPIST_VERIFY,
    PERMISSIONS.THERAPIST_VIEW_ALL,
    PERMISSIONS.POST_MODERATE,
    PERMISSIONS.COMMUNITY_MANAGE,
    PERMISSIONS.BLOG_MANAGE,
  ],
  SUPER_ADMIN: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.AUDIT_VIEW,
    // All admin permissions
    ...ROLE_PERMISSIONS.ADMIN,
  ],
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}



