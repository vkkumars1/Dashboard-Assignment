'use client'

import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardStore } from '../../engine/dashboardStore'
import type { BarChartData } from '../../types/widget.types'

interface BarChartWidgetProps {
  id: string
  title: string
  dataSource: string
}

export default React.memo(function BarChartWidget({ id, title }: BarChartWidgetProps) {
  const widgetState = useDashboardStore((state) => state.getWidgetState(id))

  // memoize to avoid rerender on every parent update
  const data = useMemo(() => {
    if (!widgetState.data) return []
    return widgetState.data as BarChartData[]
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
          />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
