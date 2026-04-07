import cron from 'node-cron'
import prisma from '../prisma'
import {
  PHASE1_LEAGUES,
  fetchMatches,
  fetchTeams,
  transformMatch,
  fetchMatchStats,
  transformStats,
} from '../services/footballApi'

const CURRENT_SEASON = 2024

// ── Sync all leagues ──────────────────────────────────────────────────────────
async function syncAllLeagues() {
  console.log(`[Sync] Starting at ${new Date().toISOString()}`)

  for (const league of PHASE1_LEAGUES) {
    try {
      await syncLeague(league.id, league.name, league.country)
      // Pause 2 seconds between leagues to respect API rate limits
      await sleep(2000)
    } catch (err) {
      console.error(`[Sync] Failed for ${league.name}:`, err)
    }
  }

  console.log('[Sync] Complete')
}

async function syncLeague(leagueId: number, name: string, country: string) {
  console.log(`[Sync] Processing ${name}...`)

  // Upsert league record
  await prisma.league.upsert({
    where: { id: leagueId },
    create: { id: leagueId, name, country, season: CURRENT_SEASON },
    update: { name, country },
  })

  // Sync teams
  const teamsData = await fetchTeams(leagueId, CURRENT_SEASON)
  for (const { team } of teamsData) {
    await prisma.team.upsert({
      where: { id: team.id },
      create: { id: team.id, name: team.name, logo: team.logo, leagueId },
      update: { name: team.name, logo: team.logo },
    })
  }

  // Sync matches
  const matchesData = await fetchMatches(leagueId, CURRENT_SEASON)
  for (const apiMatch of matchesData) {
    const matchData = transformMatch(apiMatch)

    await prisma.match.upsert({
      where: { id: matchData.id },
      create: {
        ...matchData,
        leagueId,
        homeTeamId: apiMatch.teams.home.id,
        awayTeamId: apiMatch.teams.away.id,
      },
      update: {
        status:    matchData.status,
        homeGoals: matchData.homeGoals,
        awayGoals: matchData.awayGoals,
      },
    })
  }

  // Score predictions for newly finished matches
  await scorePredictions(leagueId)

  console.log(`[Sync] ${name}: ${matchesData.length} matches synced`)
}

// ── Score predictions after matches finish ────────────────────────────────────
// Points system:
//   3 points — exact correct score (e.g. predicted 2-1, actual 2-1)
//   1 point  — correct result (win/draw/loss direction)
//   0 points — wrong result
async function scorePredictions(leagueId: number) {
  const finishedMatches = await prisma.match.findMany({
    where: {
      leagueId,
      status: 'finished',
      homeGoals: { not: null },
      awayGoals: { not: null },
      predictions: { some: { points: null } },
    },
  })

  for (const match of finishedMatches) {
    const predictions = await prisma.prediction.findMany({
      where: { matchId: match.id, points: null },
    })

    for (const pred of predictions) {
      let points = 0

      const exactScore =
        pred.predictedHome === match.homeGoals &&
        pred.predictedAway === match.awayGoals

      const correctResult =
        Math.sign(pred.predictedHome - pred.predictedAway) ===
        Math.sign((match.homeGoals ?? 0) - (match.awayGoals ?? 0))

      if (exactScore)      points = 3
      else if (correctResult) points = 1

      await prisma.prediction.update({
        where: { id: pred.id },
        data: { points },
      })
    }
  }
}

// ── Manual trigger (call this from a script to seed initial data) ─────────────
export async function runManualSync() {
  await syncAllLeagues()
}

// ── Schedule: run every hour ──────────────────────────────────────────────────
export function startSyncJob() {
  cron.schedule('0 * * * *', () => {
    syncAllLeagues().catch(console.error)
  })
  console.log('[Sync] Job scheduled — runs every hour')

  // Run immediately on startup
  syncAllLeagues().catch(console.error)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

