// Mirror of frontend types - keep them in sync
// Or better yet, in a monorepo you'd share this

export type WidgetType = 'bar' | 'line' | 'treemap' | 'scatter'

export interface BarChartData {
  label: string
  value: number
}

export interface LineChartData {
  timestamp: number | string
  value: number
  label?: string
}

export interface TreemapData {
  name: string
  value?: number
  children?: TreemapData[]
}

export interface ScatterData {
  x: number
  y: number
  label?: string
}

export type WidgetData = BarChartData[] | LineChartData[] | TreemapData | ScatterData[]

export interface WidgetDataResponse {
  type: WidgetType
  data: WidgetData
  timestamp: number
}
