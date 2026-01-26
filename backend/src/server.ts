import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dataOrchestrator } from './services/dataOrchestrator'
import type { WidgetType } from './types/widgetTypes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Serve frontend static files
// Note: Next.js 'output: export' generates an 'out' folder
const frontendPath = path.join(__dirname, '../../frontend/out')
app.use(express.static(frontendPath))

// Health check & Info
app.get('/', (req, res) => {
  res.json({
    message: 'Dashboard Builder API',
    version: '1.0.0',
    endpoints: ['/health', '/api/data/:type', '/api/data/batch']
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  })
})

// Main data endpoint - parametrized by widget type
app.get('/api/data/:type', async (req, res) => {
  const { type } = req.params

  // Validate type before processing
  const validTypes: WidgetType[] = ['bar', 'line', 'treemap', 'scatter']
  if (!validTypes.includes(type as WidgetType)) {
    return res.status(400).json({
      error: `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`,
    })
  }

  // Call orchestrator and get data
  const result = await dataOrchestrator.generateData(type as WidgetType)

  // Check if it's an error response
  if ('code' in result) {
    // error case
    return res.status(500).json({
      error: result.message,
      code: result.code,
    })
  }

  // success - send the validated data
  res.json(result)
})

// Batch endpoint for fetching multiple widgets at once
// helpful for dashboard initialization
app.post('/api/data/batch', async (req, res) => {
  const { types } = req.body

  if (!Array.isArray(types)) {
    return res.status(400).json({
      error: 'types must be an array',
    })
  }

  const validTypes: WidgetType[] = ['bar', 'line', 'treemap', 'scatter']
  const filtered = types.filter((t) => validTypes.includes(t))

  if (filtered.length === 0) {
    return res.status(400).json({
      error: 'No valid types provided',
    })
  }

  const results = await dataOrchestrator.generateDataBatch(filtered as WidgetType[])

  // Convert map to object for JSON response
  const response = Object.fromEntries(results)
  res.json(response)
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Wildcard route to serve index.html for SPA routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// Start server only when not on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[server] Dashboard API running on http://localhost:${PORT}`)
    console.log(`[server] Endpoints: GET /api/data/:type, POST /api/data/batch`)
  })
}

export default app
