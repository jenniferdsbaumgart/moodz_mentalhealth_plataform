import { useAuth } from "@/hooks/use-auth"

export function useBlogApi() {
  const { user } = useAuth()

  const getApiEndpoints = () => {
    if (user?.role === "THERAPIST") {
      return {
        list: "/api/therapist/blog/posts",
        create: "/api/therapist/blog/posts",
        update: (id: string) => `/api/admin/blog/posts/${id}`, // therapists usam admin API para update
        delete: (id: string) => `/api/admin/blog/posts/${id}`, // apenas super admin pode deletar
        get: (id: string) => `/api/admin/blog/posts/${id}`,
      }
    }

    // Admin e Super Admin usam admin APIs
    return {
      list: "/api/admin/blog/posts",
      create: "/api/admin/blog/posts",
      update: (id: string) => `/api/admin/blog/posts/${id}`,
      delete: (id: string) => `/api/admin/blog/posts/${id}`,
      get: (id: string) => `/api/admin/blog/posts/${id}`,
    }
  }

  const getPermissions = () => {
    return {
      canCreate: user?.role === "THERAPIST" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
      canEdit: user?.role === "THERAPIST" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
      canDelete: user?.role === "SUPER_ADMIN",
      canEditAnyPost: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    }
  }

  return {
    api: getApiEndpoints(),
    permissions: getPermissions(),
  }
}


