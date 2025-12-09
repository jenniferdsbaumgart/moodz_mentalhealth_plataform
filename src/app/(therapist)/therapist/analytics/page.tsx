"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OverviewCards } from "@/components/therapist/analytics/overview-cards"
import { EngagementChart } from "@/components/therapist/analytics/engagement-chart"
import { RatingsChart } from "@/components/therapist/analytics/ratings-chart"
import { SessionsBreakdown } from "@/components/therapist/analytics/sessions-breakdown"
import { DateRangePicker } from "@/components/therapist/analytics/date-range-picker"

export default function TherapistAnalyticsPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["therapist", "analytics", period, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ period })
      if (dateRange?.from && dateRange?.to) {
        params.set("from", dateRange.from.toISOString())
        params.set("to", dateRange.to.toISOString())
      }

      const res = await fetch(`/api/therapist/analytics?${params}`)
      if (!res.ok) throw new Error("Failed to fetch analytics")
      return res.json()
    }
  })

  const { data: engagementData } = useQuery({
    queryKey: ["therapist", "analytics", "engagement", period, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ period })
      if (dateRange?.from && dateRange?.to) {
        params.set("from", dateRange.from.toISOString())
        params.set("to", dateRange.to.toISOString())
      }

      const res = await fetch(`/api/therapist/analytics/engagement?${params}`)
      if (!res.ok) throw new Error("Failed to fetch engagement")
      return res.json()
    }
  })

  const { data: ratingsData } = useQuery({
    queryKey: ["therapist", "analytics", "ratings", period, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ period })
      if (dateRange?.from && dateRange?.to) {
        params.set("from", dateRange.from.toISOString())
        params.set("to", dateRange.to.toISOString())
      }

      const res = await fetch(`/api/therapist/analytics/ratings?${params}`)
      if (!res.ok) throw new Error("Failed to fetch ratings")
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <DashboardShell role="THERAPIST">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="THERAPIST">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Avançado</h1>
            <p className="text-muted-foreground">
              Métricas detalhadas e insights das suas sessões
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={(value: "month" | "quarter" | "year") => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>

        {/* Overview Cards */}
        <OverviewCards data={analyticsData} />

        {/* Analytics Tabs */}
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="ratings">Avaliações</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-6">
            <EngagementChart
              data={engagementData}
              period={period}
            />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <RatingsChart
              data={ratingsData}
              period={period}
            />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsBreakdown
              data={analyticsData}
              period={period}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

