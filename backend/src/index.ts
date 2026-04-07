import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import matchRoutes from './routes/matches'
import teamRoutes from './routes/teams'
import predictionRoutes from './routes/predictions'
import { startSyncJob } from './jobs/syncMatches'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/predictions', predictionRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong', message: err.message })
})

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`)

  // Start background job to sync match data every hour
  if (process.env.NODE_ENV === 'production') {
    startSyncJob()
  }
})

export default app

