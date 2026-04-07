import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

// ── GET /api/matches ──────────────────────────────────────────────────────────
// Query params: leagueId, status, date, limit, page
router.get('/', async (req: Request, res: Response) => {
  try {
    const { leagueId, status, limit = '20', page = '1' } = req.query

    const take = Math.min(parseInt(limit as string), 50)
    const skip = (parseInt(page as string) - 1) * take

    const where: any = {}
    if (leagueId) where.leagueId = parseInt(leagueId as string)
    if (status)   where.status   = status

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: { id: true, name: true, logo: true } },
          awayTeam: { select: { id: true, name: true, logo: true } },
          league:   { select: { id: true, name: true, country: true } },
        },
        orderBy: { kickoff: 'asc' },
        take,
        skip,
      }),
      prisma.match.count({ where }),
    ])

    res.json({
      matches,
      pagination: { total, page: parseInt(page as string), limit: take },
    })
  } catch (error) {
    console.error('Matches fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch matches' })
  }
})

// ── GET /api/matches/upcoming ─────────────────────────────────────────────────
router.get('/upcoming', async (_req: Request, res: Response) => {
  try {
    const now = new Date()
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const matches = await prisma.match.findMany({
      where: {
        status: 'scheduled',
        kickoff: { gte: now, lte: inSevenDays },
      },
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
        league:   { select: { id: true, name: true, country: true } },
      },
      orderBy: { kickoff: 'asc' },
      take: 30,
    })

    res.json({ matches })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming matches' })
  }
})

// ── GET /api/matches/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        homeTeam: true,
        awayTeam: true,
        league:   true,
      },
    })

    if (!match) return res.status(404).json({ error: 'Match not found' })

    res.json({ match })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' })
  }
})

export default router
