import { Router, Response } from 'express'
import prisma from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// All prediction routes require authentication
router.use(authenticate)

// ── POST /api/predictions ─────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, predictedHome, predictedAway } = req.body
    const userId = req.user!.id

    // Validate input
    if (matchId === undefined || predictedHome === undefined || predictedAway === undefined) {
      return res.status(400).json({ error: 'matchId, predictedHome and predictedAway are required' })
    }
    if (predictedHome < 0 || predictedAway < 0 || predictedHome > 20 || predictedAway > 20) {
      return res.status(400).json({ error: 'Score must be between 0 and 20' })
    }

    // Check match exists and is still schedulable
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (!match) return res.status(404).json({ error: 'Match not found' })
    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot predict on a match that has already started' })
    }
    if (new Date(match.kickoff) < new Date()) {
      return res.status(400).json({ error: 'Kickoff has already passed' })
    }

    // Upsert — allows editing prediction before kickoff
    const prediction = await prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      create: { userId, matchId, predictedHome, predictedAway },
      update: { predictedHome, predictedAway },
    })

    res.status(201).json({ prediction })
  } catch (error) {
    console.error('Prediction error:', error)
    res.status(500).json({ error: 'Failed to save prediction' })
  }
})

// ── GET /api/predictions/mine ─────────────────────────────────────────────────
router.get('/mine', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            homeTeam: { select: { id: true, name: true, logo: true } },
            awayTeam: { select: { id: true, name: true, logo: true } },
            league:   { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Summary stats
    const scored      = predictions.filter(p => p.points !== null)
    const totalPoints = scored.reduce((sum, p) => sum + (p.points ?? 0), 0)
    const exactScores = scored.filter(p => p.points === 3).length
    const correctResults = scored.filter(p => (p.points ?? 0) >= 1).length

    res.json({
      predictions,
      stats: {
        total: predictions.length,
        scored: scored.length,
        totalPoints,
        exactScores,
        correctResults,
        accuracy: scored.length > 0
          ? Math.round((correctResults / scored.length) * 100)
          : 0,
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' })
  }
})

// ── GET /api/predictions/leaderboard ─────────────────────────────────────────
router.get('/leaderboard', async (_req: AuthRequest, res: Response) => {
  try {
    // Group points by user and rank them
    const leaderboard = await prisma.prediction.groupBy({
      by: ['userId'],
      where: { points: { not: null } },
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 50,
    })

    // Attach usernames
    const userIds = leaderboard.map(r => r.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    })
    const userMap = Object.fromEntries(users.map(u => [u.id, u.username]))

    const ranked = leaderboard.map((row, i) => ({
      rank: i + 1,
      userId: row.userId,
      username: userMap[row.userId] || 'Unknown',
      totalPoints: row._sum.points ?? 0,
      predictions: row._count.id,
    }))

    res.json({ leaderboard: ranked })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

export default router
