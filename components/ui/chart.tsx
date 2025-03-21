import type React from "react"
export const ChartRadar = () => null
export const ChartRadarLine = () => null
export const ChartRadialBar = () => null
export const ChartTooltip = () => null
export const ChartLegend = () => null
export const Chart = ({ children, data }: { children: React.ReactNode; data: any[] }) => {
  return <div>{children}</div>
}

