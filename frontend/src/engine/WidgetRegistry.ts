import React from 'react'
import type { WidgetType } from '../types/widget.types'

// This is the magic piece - widgets are just lazy components
// New chart types? Just register them here. Core engine never changes.

type WidgetComponent = React.LazyExoticComponent<
  React.ComponentType<{
    id: string
    dataSource: string
    title: string
  }>
>

interface WidgetDefinition {
  component: WidgetComponent
  dataType: WidgetType
  minWidth: number
  minHeight: number
}

class WidgetRegistry {
  private widgets: Map<WidgetType, WidgetDefinition> = new Map()

  register(type: WidgetType, definition: WidgetDefinition) {
    this.widgets.set(type, definition)
  }

  getComponent(type: WidgetType): WidgetComponent | null {
    const def = this.widgets.get(type)
    return def?.component || null
  }

  getDefinition(type: WidgetType): WidgetDefinition | null {
    return this.widgets.get(type) || null
  }

  getAvailableTypes(): WidgetType[] {
    return Array.from(this.widgets.keys())
  }

  // useful for validation
  isRegistered(type: WidgetType): boolean {
    return this.widgets.has(type)
  }
}

// singleton instance
export const widgetRegistry = new WidgetRegistry()

// Register all available widgets here
// Lazy load components so we're not bundling everything upfront
widgetRegistry.register('bar', {
  component: React.lazy(() => import('../widgets/BarChart')),
  dataType: 'bar',
  minWidth: 3,
  minHeight: 2,
})

widgetRegistry.register('line', {
  component: React.lazy(() => import('../widgets/LineChart')),
  dataType: 'line',
  minWidth: 3,
  minHeight: 2,
})

widgetRegistry.register('treemap', {
  component: React.lazy(() => import('../widgets/TreemapChart')),
  dataType: 'treemap',
  minWidth: 4,
  minHeight: 3,
})

widgetRegistry.register('scatter', {
  component: React.lazy(() => import('../widgets/ScatterChart')),
  dataType: 'scatter',
  minWidth: 3,
  minHeight: 2,
})
