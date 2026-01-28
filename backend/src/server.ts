import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dataOrchestrator } from './services/dataOrchestrator.js'
import type { WidgetType } from './types/widgetTypes.js'
import { pool } from './lib/db.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors())
app.use(express.json())

// Serve frontend static files
// Note: Next.js 'output: export' generates an 'out' folder
const frontendPath = path.join(__dirname, '../../frontend/out')
app.use(express.static(frontendPath))

// Health check & Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  })
})

// Database Test Endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      status: 'connected',
      time: result.rows[0].now,
      message: 'Neon database is connected'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
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

// Start server
app.listen(PORT, () => {
  const host = process.env.NODE_ENV === 'production' ? 'https://dashboard-assignment-1.onrender.com' : `http://localhost:${PORT}`;
  console.log(`[server] Unified Dashboard running on ${host}`)
})

export default app
