import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import clsx from 'clsx'

interface Team {
  id: number
  name: string
  logo?: string
}

interface Match {
  id: number
  kickoff: string
  status: string
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: Team
  awayTeam: Team
  league: { name: string; country: string }
}

interface Props {
  match: Match
  showPredictButton?: boolean
}

export default function MatchCard({ match, showPredictButton = false }: Props) {
  const isFinished  = match.status === 'finished'
  const isLive      = match.status === 'live'
  const isScheduled = match.status === 'scheduled'

  return (
    <Link href={`/matches/${match.id}`} className="card hover:border-gray-700 transition-colors block">
      {/* League + time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{match.league.name} · {match.league.country}</span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
          <span className="text-xs text-gray-500">
            {isScheduled
              ? format(new Date(match.kickoff), 'EEE dd MMM · HH:mm')
              : format(new Date(match.kickoff), 'dd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-4">
        <TeamDisplay team={match.homeTeam} align="left" />

        <div className={clsx(
          'flex items-center gap-2 min-w-[80px] justify-center',
          isFinished || isLive ? 'text-2xl font-bold' : 'text-sm text-gray-500'
        )}>
          {isFinished || isLive ? (
            <>
              <span>{match.homeGoals ?? 0}</span>
              <span className="text-gray-600">–</span>
              <span>{match.awayGoals ?? 0}</span>
            </>
          ) : (
            <span>vs</span>
          )}
        </div>

        <TeamDisplay team={match.awayTeam} align="right" />
      </div>

      {showPredictButton && isScheduled && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <span className="text-xs text-brand-400 font-medium">Tap to predict score →</span>
        </div>
      )}
    </Link>
  )
}

function TeamDisplay({ team, align }: { team: Team; align: 'left' | 'right' }) {
  return (
    <div className={clsx('flex items-center gap-2 flex-1', align === 'right' && 'flex-row-reverse')}>
      {team.logo && (
        <Image
          src={team.logo}
          alt={team.name}
          width={28}
          height={28}
          className="object-contain"
        />
      )}
      <span className={clsx('text-sm font-medium text-gray-200 truncate', align === 'right' && 'text-right')}>
        {team.name}
      </span>
    </div>
  )
}

