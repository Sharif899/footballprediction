'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamsApi } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

const LEAGUES = [
  { id: 0,   name: 'All' },
  { id: 39,  name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78,  name: 'Bundesliga' },
  { id: 61,  name: 'Ligue 1' },
]

export default function TeamsPage() {
  const [leagueId, setLeagueId] = useState(0)
  const [search, setSearch]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['teams', leagueId],
    queryFn: () => teamsApi.list(leagueId || undefined),
  })

  const teams = (data?.teams ?? []).filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Teams</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teams…"
          className="input max-w-xs"
        />
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 flex-wrap">
          {LEAGUES.map(l => (
            <button
              key={l.id}
              onClick={() => setLeagueId(l.id)}
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="card animate-pulse h-20 bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {teams.map((team: any) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="card hover:border-gray-700 transition-colors flex flex-col items-center gap-2 py-4"
            >
              {team.logo ? (
                <Image src={team.logo} alt={team.name} width={40} height={40} className="object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700" />
              )}
              <span className="text-sm font-medium text-gray-200 text-center leading-tight">{team.name}</span>
              <span className="text-xs text-gray-600">{team.league?.name}</span>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && teams.length === 0 && (
        <div className="card text-center py-10 text-gray-500">
          No teams found.
        </div>
      )}
    </div>
  )
}

