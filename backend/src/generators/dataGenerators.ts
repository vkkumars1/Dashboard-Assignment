import type { BarChartData, LineChartData, TreemapData, ScatterData } from '../types/widgetTypes'

// Mock data generators - these can be replaced with real APIs later
// Keeping them separate so it's obvious where data comes from

export const generateBarChartData = (seed: number = 0): BarChartData[] => {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4']
  return categories.map((label, i) => ({
    label,
    value: Math.floor(Math.random() * 100) + 20 + seed + i * 10,
  }))
}

export const generateLineChartData = (points: number = 12, seed: number = 0): LineChartData[] => {
  const data: LineChartData[] = []
  const now = Date.now()

  for (let i = 0; i < points; i++) {
    // fake timestamp every hour
    const timestamp = now - (points - i) * 60 * 60 * 1000
    data.push({
      timestamp,
      value: Math.floor(Math.random() * 50) + 40 + seed,
      label: `Hour ${i}`,
    })
  }

  return data
}

export const generateTreemapData = (seed: number = 0): TreemapData => {
  // hierarchical data structure
  return {
    name: 'Analytics',
    children: [
      {
        name: 'Frontend',
        children: [
          { name: 'React', value: 35 + seed },
          { name: 'Vue', value: 25 + seed },
          { name: 'Angular', value: 20 + seed },
        ],
      },
      {
        name: 'Backend',
        children: [
          { name: 'Node.js', value: 40 + seed },
          { name: 'Python', value: 30 + seed },
          { name: 'Java', value: 15 + seed },
        ],
      },
    ],
  }
}

export const generateScatterData = (points: number = 50, seed: number = 0): ScatterData[] => {
  const data: ScatterData[] = []

  for (let i = 0; i < points; i++) {
    data.push({
      x: Math.random() * 100 + seed,
      y: Math.random() * 100 + seed,
      label: `Point ${i}`,
    })
  }

  return data
}

// Orchestrator - maps widget type to its generator
export type GeneratorType = 'bar' | 'line' | 'treemap' | 'scatter'

export const getGenerator = (type: GeneratorType) => {
  const generators: Record<GeneratorType, (seed: number) => any> = {
    bar: generateBarChartData,
    line: generateLineChartData,
    treemap: generateTreemapData,
    scatter: generateScatterData,
  }

  return generators[type]
}
