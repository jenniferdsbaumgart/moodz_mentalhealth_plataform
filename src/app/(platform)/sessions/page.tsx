"use client"

import { useState, useEffect, useMemo } from "react"
import { GroupSession, SessionCategory } from "@prisma/client"
import { MainLayout } from "@/components/layout/main-layout"
import { SessionFiltersComponent, type SessionFilters } from "@/components/sessions/session-filters"
import { SessionsGrid } from "@/components/sessions/sessions-grid"
import { isAfter, isBefore, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

interface SessionWithTherapist extends GroupSession {
  therapist: {
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }
  _count: {
    participants: number
  }
}

export default function SessionsPage() {
  const [allSessions, setAllSessions] = useState<SessionWithTherapist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<SessionFilters>({
    categories: [],
    dateRange: "all",
    availability: "all",
    therapist: "",
    searchQuery: "",
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/public/sessions")
      if (response.ok) {
        const data = await response.json()
        setAllSessions(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSessions = useMemo(() => {
    return allSessions.filter((session) => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(session.category)) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const sessionDate = new Date(session.scheduledAt)
        const now = new Date()

        switch (filters.dateRange) {
          case "today":
            if (!isAfter(sessionDate, startOfDay(now)) || !isBefore(sessionDate, endOfDay(now))) {
              return false
            }
            break
          case "week":
            if (!isAfter(sessionDate, startOfWeek(now)) || !isBefore(sessionDate, endOfWeek(now))) {
              return false
            }
            break
          case "month":
            if (!isAfter(sessionDate, startOfMonth(now)) || !isBefore(sessionDate, endOfMonth(now))) {
              return false
            }
            break
        }
      }

      // Availability filter
      const availableSpots = session.maxParticipants - session._count.participants
      if (filters.availability === "available" && availableSpots <= 0) {
        return false
      }
      if (filters.availability === "full" && availableSpots > 0) {
        return false
      }

      // Therapist filter
      if (filters.therapist && !session.therapist.user.name?.toLowerCase().includes(filters.therapist.toLowerCase())) {
        return false
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesTitle = session.title.toLowerCase().includes(query)
        const matchesDescription = session.description.toLowerCase().includes(query)
        const matchesTags = session.tags?.some(tag => tag.toLowerCase().includes(query))

        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false
        }
      }

      // Only show scheduled or live sessions
      return session.status === "SCHEDULED" || session.status === "LIVE"
    })
  }, [allSessions, filters])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sessões Disponíveis</h1>
          <p className="text-muted-foreground">
            Encontre sessões de terapia em grupo que atendam às suas necessidades
          </p>
        </div>

        <SessionFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={filteredSessions.length}
        />

        <SessionsGrid
          sessions={filteredSessions}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  )
}
