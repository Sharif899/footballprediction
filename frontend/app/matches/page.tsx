'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/lib/api'
import MatchCard from '@/components/MatchCard'

const LEAGUES = [
  { id: 0,   name: 'All leagues' },
  { id: 39,  name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78,  name: 'Bundesliga' },
  { id: 61,  name: 'Ligue 1' },
]

const STATUSES = [
  { value: '',          label: 'All' },
  { value: 'scheduled', label: 'Upcoming' },
  { value: 'live',      label: 'Live' },
  { value: 'finished',  label: 'Finished' },
]

export default function MatchesPage() {
  const [leagueId, setLeagueId]   = useState(0)
  const [status,   setStatus]     = useState('')
  const [page,     setPage]       = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['matches', leagueId, status, page],
    queryFn: () => matchesApi.list({
      leagueId: leagueId || undefined,
      status:   status   || undefined,
      page,
    }),
  })

  const matches    = data?.matches ?? []
  const totalPages = Math.ceil((data?.pagination?.total ?? 0) / 20)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Matches</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* League filter */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {LEAGUES.map(l => (
            <button
              key={l.id}
              onClick={() => { setLeagueId(l.id); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                leagueId === l.id
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                status === s.value
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match list */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card animate-pulse h-28 bg-gray-800" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          No matches found for these filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {matches.map((match: any) => (
            <MatchCard key={match.id} match={match} showPredictButton />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary text-sm py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

