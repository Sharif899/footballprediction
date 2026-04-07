import axios from 'axios'

// The 5 leagues we cover in Phase 1 with their API-Football league IDs
export const PHASE1_LEAGUES = [
  { id: 39,  name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga',        country: 'Spain'   },
  { id: 135, name: 'Serie A',        country: 'Italy'   },
  { id: 78,  name: 'Bundesliga',     country: 'Germany' },
  { id: 61,  name: 'Ligue 1',        country: 'France'  },
]

const apiClient = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
  headers: {
    'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY!,
    'X-RapidAPI-Host': process.env.FOOTBALL_API_HOST!,
  },
})

// ── Fetch upcoming + recent matches for a league ──────────────────────────────
export async function fetchMatches(leagueId: number, season: number) {
  const response = await apiClient.get('/fixtures', {
    params: { league: leagueId, season },
  })
  return response.data.response
}

// ── Fetch teams in a league ───────────────────────────────────────────────────
export async function fetchTeams(leagueId: number, season: number) {
  const response = await apiClient.get('/teams', {
    params: { league: leagueId, season },
  })
  return response.data.response
}

// ── Fetch detailed stats for a specific match ─────────────────────────────────
export async function fetchMatchStats(fixtureId: number) {
  const response = await apiClient.get('/fixtures/statistics', {
    params: { fixture: fixtureId },
  })
  return response.data.response
}

// ── Fetch league standings ────────────────────────────────────────────────────
export async function fetchStandings(leagueId: number, season: number) {
  const response = await apiClient.get('/standings', {
    params: { league: leagueId, season },
  })
  return response.data.response
}

// ── Convert API-Football match data to our database shape ─────────────────────
export function transformMatch(apiMatch: any) {
  return {
    id:        apiMatch.fixture.id,
    kickoff:   new Date(apiMatch.fixture.date),
    status:    mapStatus(apiMatch.fixture.status.short),
    homeGoals: apiMatch.goals.home,
    awayGoals: apiMatch.goals.away,
    venue:     apiMatch.fixture.venue?.name || null,
    round:     apiMatch.league.round || null,
  }
}

function mapStatus(apiStatus: string): string {
  const map: Record<string, string> = {
    'NS':  'scheduled',
    '1H':  'live', '2H': 'live', 'HT': 'live',
    'ET':  'live', 'P':  'live',
    'FT':  'finished', 'AET': 'finished', 'PEN': 'finished',
    'PST': 'postponed', 'CANC': 'postponed',
  }
  return map[apiStatus] || 'scheduled'
}

// ── Parse raw stats into clean JSON shape ─────────────────────────────────────
export function transformStats(apiStats: any[]) {
  if (!apiStats || apiStats.length < 2) return null

  const home = apiStats[0].statistics
  const away = apiStats[1].statistics

  const get = (arr: any[], type: string) =>
    arr.find((s: any) => s.type === type)?.value ?? 0

  return {
    shots:       { home: get(home, 'Total Shots'),       away: get(away, 'Total Shots') },
    shotsOnTarget: { home: get(home, 'Shots on Goal'),   away: get(away, 'Shots on Goal') },
    possession:  { home: parseInt(get(home, 'Ball Possession')) || 50,
                   away: parseInt(get(away, 'Ball Possession')) || 50 },
    corners:     { home: get(home, 'Corner Kicks'),      away: get(away, 'Corner Kicks') },
    fouls:       { home: get(home, 'Fouls'),             away: get(away, 'Fouls') },
    yellowCards: { home: get(home, 'Yellow Cards'),      away: get(away, 'Yellow Cards') },
    redCards:    { home: get(home, 'Red Cards'),         away: get(away, 'Red Cards') },
    passes:      { home: get(home, 'Total passes'),      away: get(away, 'Total passes') },
  }
}

