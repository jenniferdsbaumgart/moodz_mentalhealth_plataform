"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, TrendingDown, Target, Calendar, Zap } from "lucide-react"

interface MoodInsightsProps {
  insights: string[]
  className?: string
}

export function MoodInsights({ insights, className }: MoodInsightsProps) {
  const getInsightIcon = (insight: string) => {
    if (insight.includes("streak") || insight.includes("Sequência")) {
      return <Zap className="h-5 w-5 text-orange-500" />
    }
    if (insight.includes("melhora") || insight.includes("melhorou")) {
      return <TrendingUp className="h-5 w-5 text-green-500" />
    }
    if (insight.includes("diminuiu") || insight.includes("piora")) {
      return <TrendingDown className="h-5 w-5 text-red-500" />
    }
    if (insight.includes("atividade") || insight.includes("exercício")) {
      return <Target className="h-5 w-5 text-blue-500" />
    }
    if (insight.includes("dia") || insight.includes("semana")) {
      return <Calendar className="h-5 w-5 text-purple-500" />
    }
    return <Lightbulb className="h-5 w-5 text-yellow-500" />
  }

  const getInsightType = (insight: string): "positive" | "negative" | "neutral" => {
    if (insight.includes("melhora") || insight.includes("melhorou") || insight.includes("streak") || insight.includes("ótimo")) {
      return "positive"
    }
    if (insight.includes("diminuiu") || insight.includes("piora") || insight.includes("ansioso") || insight.includes("mal")) {
      return "negative"
    }
    return "neutral"
  }

  const getInsightColor = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50 dark:bg-green-900/10"
      case "negative":
        return "border-red-200 bg-red-50 dark:bg-red-900/10"
      default:
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/10"
    }
  }

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights de Bem-estar
          </CardTitle>
          <CardDescription>
            Continue registrando para obter insights personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Registre seu humor por alguns dias para começar a ver padrões e insights interessantes sobre seu bem-estar emocional.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights de Bem-estar
        </CardTitle>
        <CardDescription>
          Descobertas automáticas baseadas nos seus registros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const type = getInsightType(insight)
            const colorClass = getInsightColor(type)

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${colorClass}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight)}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{insight}</p>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          type === "positive"
                            ? "border-green-300 text-green-700"
                            : type === "negative"
                            ? "border-red-300 text-red-700"
                            : "border-blue-300 text-blue-700"
                        }`}
                      >
                        {type === "positive" ? "Positivo" : type === "negative" ? "Atenção" : "Neutro"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Como os insights são gerados?</p>
              <p>
                Analisamos seus registros para identificar padrões como correlações entre atividades e humor,
                tendências semanais e melhorias ao longo do tempo.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
