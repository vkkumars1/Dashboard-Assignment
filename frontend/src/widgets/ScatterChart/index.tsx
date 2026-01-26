'use client'

import React, { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardStore } from '../../engine/dashboardStore'
import type { ScatterData } from '../../types/widget.types'

interface ScatterWidgetProps {
  id: string
  title: string
  dataSource: string
}

export default React.memo(function ScatterWidget({ id, title }: ScatterWidgetProps) {
  const widgetState = useDashboardStore((state) => state.getWidgetState(id))

  const data = useMemo(() => {
    if (!widgetState.data) return []
    return widgetState.data as ScatterData[]
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
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="x" stroke="#64748b" type="number" style={{ fontSize: '12px' }} />
          <YAxis dataKey="y" stroke="#64748b" type="number" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
          />
          <Legend />
          <Scatter name="Data Points" data={data} fill="#ec4899" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
})
