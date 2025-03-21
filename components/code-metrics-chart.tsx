"use client"
import { Chart, ChartRadar, ChartRadarLine, ChartTooltip } from "@/components/ui/chart"

interface CodeMetricsChartProps {
  metrics: {
    readability: number
    maintainability: number
    efficiency: number
    bestPractices: number
    security: number
  }
}

export function CodeMetricsChart({ metrics }: CodeMetricsChartProps) {
  const data = [
    {
      subject: "Readability",
      value: metrics.readability,
      fullMark: 100,
    },
    {
      subject: "Maintainability",
      value: metrics.maintainability,
      fullMark: 100,
    },
    {
      subject: "Efficiency",
      value: metrics.efficiency,
      fullMark: 100,
    },
    {
      subject: "Best Practices",
      value: metrics.bestPractices,
      fullMark: 100,
    },
    {
      subject: "Security",
      value: metrics.security,
      fullMark: 100,
    },
  ]

  return (
    <Chart className="w-full h-full" data={data}>
      <ChartRadar dataKey="fullMark" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
      <ChartRadarLine dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
      <ChartTooltip />
    </Chart>
  )
}

