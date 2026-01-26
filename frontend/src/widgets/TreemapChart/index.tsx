'use client'

import React, { useMemo } from 'react'
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardStore } from '../../engine/dashboardStore'
import type { TreemapData } from '../../types/widget.types'

interface TreemapWidgetProps {
  id: string
  title: string
  dataSource: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Flatten nested structure for Recharts - it expects a flat array
const flattenTreemap = (node: TreemapData, depth = 0): any[] => {
  const result: any[] = []

  if (node.value) {
    result.push({
      name: node.name,
      value: node.value,
      depth,
    })
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      result.push(...flattenTreemap(child, depth + 1))
    })
  }

  return result
}

export default React.memo(function TreemapWidget({ id, title }: TreemapWidgetProps) {
  const widgetState = useDashboardStore((state) => state.getWidgetState(id))

  const data = useMemo(() => {
    if (!widgetState.data) return []
    const raw = widgetState.data as TreemapData
    // flatten the single root node for Recharts
    return flattenTreemap(raw)
  }, [widgetState.data])

  if (widgetState.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          stroke="#fff"
          fill="#3b82f6"
          isAnimationActive={false}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
})
