'use client'

import { useQuery } from '@tanstack/react-query'
import { predictionsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Trophy, Medal } from 'lucide-react'
import clsx from 'clsx'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: predictionsApi.leaderboard,
  })

  const leaderboard = data?.leaderboard ?? []

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={16} className="text-yellow-400" />
    if (rank === 2) return <Medal  size={16} className="text-gray-400"   />
    if (rank === 3) return <Medal  size={16} className="text-amber-600"  />
    return <span className="text-gray-500 text-sm w-4 text-center">{rank}</span>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">Top predictors ranked by total points</p>
      </div>

      {/* Points explanation */}
      <div className="card flex gap-6 text-sm">
        <div className="text-center">
          <div className="text-xl font-bold text-brand-400">3 pts</div>
          <div className="text-gray-500 text-xs mt-0.5">Exact score</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">1 pt</div>
          <div className="text-gray-500 text-xs mt-0.5">Correct result</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-600">0 pts</div>
          <div className="text-gray-500 text-xs mt-0.5">Wrong result</div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_80px] text-xs text-gray-500 px-4 py-2.5 border-b border-gray-800">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">Predictions</span>
          <span className="text-right">Points</span>
        </div>

        {isLoading ? (
          <div className="space-y-px">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 animate-pulse mx-4 my-1 rounded" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={32} className="mx-auto mb-2 opacity-30" />
            <p>No predictions scored yet.</p>
            <p className="text-xs mt-1">Leaderboard fills up as matches finish.</p>
          </div>
        ) : (
          leaderboard.map((row: any) => (
            <div
              key={row.userId}
              className={clsx(
                'grid grid-cols-[40px_1fr_80px_80px] items-center px-4 py-3 border-b border-gray-800/50 last:border-0',
                row.username === user?.username && 'bg-brand-950'
              )}
            >
              <div className="flex justify-center">{rankIcon(row.rank)}</div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300">
                  {row.username[0].toUpperCase()}
                </div>
                <span className={clsx(
                  'text-sm font-medium',
                  row.username === user?.username ? 'text-brand-400' : 'text-gray-200'
                )}>
                  {row.username}
                  {row.username === user?.username && (
                    <span className="ml-1.5 text-xs text-brand-600">(you)</span>
                  )}
                </span>
              </div>
              <div className="text-right text-sm text-gray-400">{row.predictions}</div>
              <div className="text-right text-sm font-bold text-white">{row.totalPoints}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

