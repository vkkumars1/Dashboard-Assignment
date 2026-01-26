'use client'

import React, { useState, useEffect } from 'react'
import { GripVertical, X, Plus } from 'lucide-react'
import GridLayout, { Layout } from 'react-grid-layout'
import { useDashboardStore } from '../engine/dashboardStore'
import { layoutPersistence } from '../engine/layoutPersistence'
import { WidgetRenderer } from '../engine/WidgetRenderer'
import { widgetRegistry } from '../engine/WidgetRegistry'
import type { DashboardLayout, WidgetConfig } from '../types/widget.types'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const Dashboard: React.FC = () => {
  const currentLayout = useDashboardStore((state) => state.currentLayout)
  const setLayout = useDashboardStore((state) => state.setLayout)
  const updateWidgetPosition = useDashboardStore((state) => state.updateWidgetPosition)
  const removeWidget = useDashboardStore((state) => state.removeWidget)
  const addWidget = useDashboardStore((state) => state.addWidget)

  const [isEditing, setIsEditing] = useState(false)

  // Initialize with a sample dashboard - loads from IndexedDB/localStorage
  useEffect(() => {
    const initializeLayout = async () => {
      const savedLayout = await layoutPersistence.loadLayout('default')
      if (savedLayout) {
        setLayout(savedLayout)
      } else {
        // Create default layout
        const defaultLayout: DashboardLayout = {
          id: 'default',
          name: 'My Dashboard',
          widgets: [
            {
              id: 'widget-1',
              type: 'bar',
              title: 'Revenue by Quarter',
              dataSource: 'bar',
              position: { x: 0, y: 0, w: 6, h: 3 },
            },
            {
              id: 'widget-2',
              type: 'line',
              title: 'Trends Over Time',
              dataSource: 'line',
              position: { x: 6, y: 0, w: 6, h: 3 },
            },
            {
              id: 'widget-3',
              type: 'treemap',
              title: 'Technology Distribution',
              dataSource: 'treemap',
              position: { x: 0, y: 3, w: 6, h: 4 },
            },
            {
              id: 'widget-4',
              type: 'scatter',
              title: 'Performance Correlation',
              dataSource: 'scatter',
              position: { x: 6, y: 3, w: 6, h: 4 },
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        setLayout(defaultLayout)
        // Save default layout so it persists across sessions
        await layoutPersistence.saveLayout(defaultLayout)
      }
    }
    initializeLayout()
  }, [setLayout])

  // Persist layout on changes - survives browser restart and page refresh
  useEffect(() => {
    if (currentLayout) {
      layoutPersistence.saveLayout(currentLayout).catch((err) => {
        console.error('[Dashboard] Failed to persist layout:', err)
      })
    }
  }, [currentLayout])

  if (!currentLayout) {
    return <div className="p-4 text-slate-500">Loading dashboard...</div>
  }

  // Convert widget configs to grid layout
  const gridLayout: Layout[] = currentLayout.widgets.map((w) => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.position.w,
    h: w.position.h,
    static: false,
  }))

  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach((item) => {
      updateWidgetPosition(item.i, {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      })
    })
  }

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId)
  }

  const handleAddWidget = (type: any) => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type} Chart`,
      dataSource: type,
      position: { x: 0, y: 100, w: 6, h: 3 },
    }
    addWidget(newWidget)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentLayout.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {currentLayout.widgets.length} widget{currentLayout.widgets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditing ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit Layout'}
          </button>
        </div>
      </div>

      {/* Widget Library */}
      {isEditing && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-900 mb-3">Add Widget:</p>
          <div className="flex gap-2 flex-wrap">
            {widgetRegistry.getAvailableTypes().map((type) => (
              <button
                key={type}
                onClick={() => handleAddWidget(type)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
              >
                <Plus size={16} />
                Add {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid with widgets */}
      <div className="p-4 max-w-7xl mx-auto">
        <GridLayout
          className="layout"
          layout={gridLayout}
          cols={12}
          rowHeight={80}
          width={1280}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms={true}
        >
          {currentLayout.widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Widget header with controls */}
              {isEditing && (
                <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={16} className="text-slate-400 cursor-grab" />
                  <span className="flex-1 text-xs font-medium text-slate-600">{widget.id}</span>
                  <button
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="p-1 hover:bg-red-200 rounded text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Widget content */}
              <WidgetRenderer widget={widget} />
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  )
}

export default Dashboard
