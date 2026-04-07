import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

// ── GET /api/teams ────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query

    const where: any = {}
    if (leagueId) where.leagueId = parseInt(leagueId as string)

    const teams = await prisma.team.findMany({
      where,
      include: {
        league: { select: { id: true, name: true, country: true } },
      },
      orderBy: { name: 'asc' },
    })

    res.json({ teams })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
})

// ── GET /api/teams/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.id)

    // Last 10 matches for this team
    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'finished',
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { kickoff: 'desc' },
      take: 10,
    })

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { league: true },
    })

    if (!team) return res.status(404).json({ error: 'Team not found' })

    // Calculate basic form stats
    const form = recentMatches.map(m => {
      const isHome = m.homeTeamId === teamId
      const teamGoals = isHome ? m.homeGoals : m.awayGoals
      const oppGoals  = isHome ? m.awayGoals : m.homeGoals
      if (teamGoals === null || oppGoals === null) return null
      if (teamGoals > oppGoals) return 'W'
      if (teamGoals < oppGoals) return 'L'
      return 'D'
    }).filter(Boolean)

    res.json({ team, recentMatches, form })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' })
  }
})

export default router
