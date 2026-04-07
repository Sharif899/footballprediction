'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/lib/api'
import MatchCard from '@/components/MatchCard'
import { Trophy, Target, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: matchesApi.upcoming,
  })

  const matches = data?.matches?.slice(0, 6) ?? []

  return (
    <div className="space-y-10">

      {/* Hero */}
      <section className="text-center py-10">
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Predict. Compete. Win.
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
          Predict football scores across the world's top leagues, track your accuracy,
          and climb the leaderboard against thousands of fans.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/predict" className="btn-primary text-base px-6 py-2.5">
            Start predicting
          </Link>
          <Link href="/leaderboard" className="btn-secondary text-base px-6 py-2.5">
            View leaderboard
          </Link>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Trophy,    label: 'Leagues covered', value: '5' },
          { icon: Target,    label: 'Predictions made', value: '—' },
          { icon: TrendingUp,label: 'Avg accuracy',     value: '—' },
          { icon: Users,     label: 'Active predictors',value: '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className="text-brand-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </section>

      {/* Upcoming matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming matches</h2>
          <Link href="/matches" className="text-sm text-brand-400 hover:text-brand-300">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse h-28 bg-gray-800" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">
            <p>No upcoming matches yet.</p>
            <p className="text-sm mt-1">Data will appear once the sync job runs.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {matches.map((match: any) => (
              <MatchCard key={match.id} match={match} showPredictButton />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="card">
        <h2 className="text-lg font-semibold text-white mb-5">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Pick a match',    desc: 'Choose any upcoming fixture from the top 5 European leagues.' },
            { step: '2', title: 'Predict the score', desc: 'Enter your predicted scoreline before kickoff.' },
            { step: '3', title: 'Earn points',     desc: 'Exact score = 3 pts. Correct result = 1 pt. Track your rank.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-900 text-brand-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <div>
                <div className="font-medium text-white text-sm">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
