'use client';

import React, { Suspense, useEffect } from 'react'
import { widgetRegistry } from './WidgetRegistry'
import { useDashboardStore } from './dashboardStore'
import { dataService } from '../services/dataService'
import type { WidgetConfig } from '../types/widget.types'

interface WidgetRendererProps {
  widget: WidgetConfig
}

// Fallback while widget is lazy-loading
const WidgetSkeleton = () => (
  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-100 to-slate-50">
    <div className="text-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mx-auto mb-2" />
      <p className="text-sm text-slate-500">Loading chart...</p>
    </div>
  </div>
)

// Error display
const WidgetError = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center w-full h-full bg-red-50 rounded border border-red-200">
    <div className="text-center p-4">
      <p className="text-sm font-medium text-red-900">Unable to load widget</p>
      <p className="text-xs text-red-700 mt-1">{message}</p>
    </div>
  </div>
)

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const setWidgetData = useDashboardStore((state) => state.setWidgetData)
  const setWidgetLoading = useDashboardStore((state) => state.setWidgetLoading)
  const setWidgetError = useDashboardStore((state) => state.setWidgetError)
  const widgetState = useDashboardStore((state) => state.getWidgetState(widget.id))

  // Fetch data on mount or when dataSource changes
  useEffect(() => {
    const fetchData = async () => {
      setWidgetLoading(widget.id, true)

      const result = await dataService.fetchWidgetData(widget.dataSource)
      setWidgetData(widget.id, result)

      if (result.error) {
        setWidgetError(widget.id, result.error)
      } else {
        setWidgetError(widget.id, null)
      }
    }

    fetchData()

    // Optional: set up refresh interval
    let refreshInterval: NodeJS.Timer | null = null
    if (widget.refreshInterval) {
      refreshInterval = setInterval(fetchData, widget.refreshInterval)
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [widget.id, widget.dataSource, widget.refreshInterval, setWidgetLoading, setWidgetData, setWidgetError])

  // Get the component from registry
  const Component = widgetRegistry.getComponent(widget.type)

  if (!Component) {
    return <WidgetError message={`Widget type not registered: ${widget.type}`} />
  }

  if (widgetState.error) {
    return <WidgetError message={widgetState.error} />
  }

  // Render component with data
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <Component id={widget.id} dataSource={widget.dataSource} title={widget.title} />
    </Suspense>
  )
}
