'use client'

import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardStore } from '../../engine/dashboardStore'
import type { LineChartData } from '../../types/widget.types'

interface LineChartWidgetProps {
  id: string
  title: string
  dataSource: string
}

export default React.memo(function LineChartWidget({ id, title }: LineChartWidgetProps) {
  const widgetState = useDashboardStore((state) => state.getWidgetState(id))

  const data = useMemo(() => {
    if (!widgetState.data) return []
    // convert timestamps to readable format for display
    return (widgetState.data as LineChartData[]).map((d) => ({
      ...d,
      timestamp: typeof d.timestamp === 'number' ? new Date(d.timestamp).toLocaleTimeString() : d.timestamp,
    }))
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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="timestamp" stroke="#64748b" style={{ fontSize: '12px' }} />
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
