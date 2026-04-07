'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchesApi, predictionsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, Lock } from 'lucide-react'

export default function PredictPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: matchesApi.upcoming,
  })

  // Track predictions entered per match: { [matchId]: { home, away } }
  const [inputs, setInputs] = useState<Record<number, { home: string; away: string }>>({})
  const [submitted, setSubmitted] = useState<Set<number>>(new Set())

  const mutation = useMutation({
    mutationFn: predictionsApi.submit,
    onSuccess: (_, vars) => {
      setSubmitted(prev => new Set(prev).add(vars.matchId))
      queryClient.invalidateQueries({ queryKey: ['predictions', 'mine'] })
    },
  })

  const handleSubmit = (matchId: number) => {
    const vals = inputs[matchId]
    if (!vals) return
    const home = parseInt(vals.home)
    const away = parseInt(vals.away)
    if (isNaN(home) || isNaN(away)) return
    mutation.mutate({ matchId, predictedHome: home, predictedAway: away })
  }

  const setInput = (matchId: number, side: 'home' | 'away', val: string) => {
    setInputs(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: val },
    }))
  }

  const matches = data?.matches ?? []

  if (!user) {
    return (
      <div className="card text-center py-16 max-w-md mx-auto mt-10">
        <Lock size={36} className="text-gray-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-white mb-2">Sign in to predict</h2>
        <p className="text-gray-500 text-sm mb-5">You need an account to submit predictions and earn points.</p>
        <Link href="/auth" className="btn-primary">Create free account</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Predict scores</h1>
        <p className="text-gray-500 text-sm mt-1">
          Exact score = 3 pts &nbsp;·&nbsp; Correct result = 1 pt
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-28 bg-gray-800" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          No upcoming matches to predict right now.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match: any) => {
            const done = submitted.has(match.id)
            const inp  = inputs[match.id] ?? { home: '', away: '' }
            const ready = inp.home !== '' && inp.away !== ''

            return (
              <div key={match.id} className="card">
                {/* League + date */}
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>{match.league.name}</span>
                  <span>{format(new Date(match.kickoff), 'EEE dd MMM · HH:mm')}</span>
                </div>

                {/* Teams + score inputs */}
                <div className="flex items-center gap-3">
                  {/* Home team */}
                  <div className="flex items-center gap-2 flex-1">
                    {match.homeTeam.logo && (
                      <Image src={match.homeTeam.logo} alt="" width={24} height={24} className="object-contain" />
                    )}
                    <span className="text-sm font-medium text-gray-200 truncate">{match.homeTeam.name}</span>
                  </div>

                  {/* Score inputs */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="20"
                      value={inp.home}
                      onChange={e => setInput(match.id, 'home', e.target.value)}
                      disabled={done}
                      className="input w-14 text-center text-lg font-bold"
                      placeholder="0"
                    />
                    <span className="text-gray-600 font-bold">–</span>
                    <input
                      type="number" min="0" max="20"
                      value={inp.away}
                      onChange={e => setInput(match.id, 'away', e.target.value)}
                      disabled={done}
                      className="input w-14 text-center text-lg font-bold"
                      placeholder="0"
                    />
                  </div>

                  {/* Away team */}
                  <div className="flex items-center gap-2 flex-1 flex-row-reverse">
                    {match.awayTeam.logo && (
                      <Image src={match.awayTeam.logo} alt="" width={24} height={24} className="object-contain" />
                    )}
                    <span className="text-sm font-medium text-gray-200 truncate text-right">{match.awayTeam.name}</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="mt-3 flex justify-end">
                  {done ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-400">
                      <CheckCircle size={15} /> Prediction saved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSubmit(match.id)}
                      disabled={!ready || mutation.isPending}
                      className="btn-primary text-sm py-1.5"
                    >
                      {mutation.isPending ? 'Saving…' : 'Save prediction'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

