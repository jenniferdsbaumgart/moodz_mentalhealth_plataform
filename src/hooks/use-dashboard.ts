import { useQuery } from "@tanstack/react-query"

export function usePatientDashboard() {
  return useQuery({
    queryKey: ["dashboard", "patient"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/patient")
      if (!res.ok) throw new Error("Failed to fetch dashboard")
      return res.json()
    }
  })
}

export function useTherapistDashboard() {
  return useQuery({
    queryKey: ["dashboard", "therapist"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/therapist")
      if (!res.ok) throw new Error("Failed to fetch dashboard")
      return res.json()
    }
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/admin")
      if (!res.ok) throw new Error("Failed to fetch dashboard")
      return res.json()
    }
  })
}
