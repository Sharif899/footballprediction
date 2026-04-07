'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  shots:          { home: number; away: number }
  shotsOnTarget:  { home: number; away: number }
  possession:     { home: number; away: number }
  corners:        { home: number; away: number }
  fouls:          { home: number; away: number }
  yellowCards:    { home: number; away: number }
}

interface Props {
  stats: Stats
  homeTeam: string
  awayTeam: string
}

export default function StatsChart({ stats, homeTeam, awayTeam }: Props) {
  const rows = [
    { label: 'Possession %',   home: stats.possession.home,    away: stats.possession.away    },
    { label: 'Shots',          home: stats.shots.home,         away: stats.shots.away         },
    { label: 'Shots on target',home: stats.shotsOnTarget.home, away: stats.shotsOnTarget.away },
    { label: 'Corners',        home: stats.corners.home,       away: stats.corners.away       },
    { label: 'Fouls',          home: stats.fouls.home,         away: stats.fouls.away         },
    { label: 'Yellow cards',   home: stats.yellowCards.home,   away: stats.yellowCards.away   },
  ]

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const total = row.home + row.away || 1
        const homePct = Math.round((row.home / total) * 100)
        const awayPct = 100 - homePct

        return (
          <div key={row.label}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="font-medium text-brand-400">{row.home}</span>
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-blue-400">{row.away}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
              <div
                className="bg-brand-500 transition-all duration-500"
                style={{ width: `${homePct}%` }}
              />
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${awayPct}%` }}
              />
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-brand-500" />{homeTeam}
        </span>
        <span className="flex items-center gap-1">
          {awayTeam}<span className="w-2 h-2 rounded-full bg-blue-500" />
        </span>
      </div>
    </div>
  )
}

// ── Form bar chart (W/D/L over last N games) ──────────────────────────────────
export function FormChart({ form }: { form: string[] }) {
  const data = form.map((result, i) => ({
    game: `G${i + 1}`,
    value: result === 'W' ? 3 : result === 'D' ? 1 : 0,
    result,
  }))

  const colorMap: Record<string, string> = {
    W: '#22c55e',
    D: '#6b7280',
    L: '#ef4444',
  }

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} barSize={18}>
        <XAxis dataKey="game" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={false}
          content={({ payload }) => {
            if (!payload?.length) return null
            const { result } = payload[0].payload
            return (
              <div className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs">
                {result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colorMap[entry.result]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
