import { z } from 'zod'

// Strict schemas for each data type
// If data doesn't match, we catch it before sending to frontend

export const BarChartSchema = z.array(
  z.object({
    label: z.string(),
    value: z.number(),
  })
)

export const LineChartSchema = z.array(
  z.object({
    timestamp: z.union([z.number(), z.string()]),
    value: z.number(),
    label: z.string().optional(),
  })
)

export const TreemapNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    value: z.number().optional(),
    children: z.array(TreemapNodeSchema).optional(),
  })
)

// Treemap is a single root node with nested children (hierarchical)
export const TreemapSchema = TreemapNodeSchema

export const ScatterSchema = z.array(
  z.object({
    x: z.number(),
    y: z.number(),
    label: z.string().optional(),
  })
)

// Response wrapper
export const WidgetDataResponseSchema = z.object({
  type: z.enum(['bar', 'line', 'treemap', 'scatter']),
  data: z.union([BarChartSchema, LineChartSchema, TreemapSchema, ScatterSchema]),
  timestamp: z.number(),
})

export type WidgetDataResponse = z.infer<typeof WidgetDataResponseSchema>
