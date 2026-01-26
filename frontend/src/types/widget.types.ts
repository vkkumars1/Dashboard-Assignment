// Core widget type definitions - keeps our contracts clear
// Adding a new chart? Just extend WidgetType and the registry will handle it

export type WidgetType = 'bar' | 'line' | 'treemap' | 'scatter'

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  dataSource: string // points to /api/data/:dataSource
  position: WidgetPosition
  lastUpdated?: number
  refreshInterval?: number // ms, optional
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: WidgetConfig[]
  createdAt: number
  updatedAt: number
}

// Data schemas for each visualization type
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

// Generic widget data type
export type WidgetData = BarChartData[] | LineChartData[] | TreemapData | ScatterData[]

export interface WidgetDataResponse {
  type: WidgetType
  data: WidgetData
  timestamp: number
}

// UI states we care about
export interface WidgetState {
  isLoading: boolean
  error: string | null
  data: WidgetData | null
}
