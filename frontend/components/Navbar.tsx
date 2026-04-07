'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Calendar, Users, Target, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import clsx from 'clsx'

const navLinks = [
  { href: '/matches',     label: 'Matches',     icon: Calendar },
  { href: '/predict',     label: 'Predict',     icon: Target   },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy   },
  { href: '/teams',       label: 'Teams',       icon: Users    },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <span className="text-brand-500 text-2xl">⚽</span>
          <span className="hidden sm:block">FootballPredictor</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-brand-900 text-brand-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )}
            >
              <Icon size={15} />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" className="text-sm text-gray-400 hover:text-gray-100 hidden sm:block">
                @{user.username}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1"
              >
                <LogOut size={15} />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <Link href="/auth" className="flex items-center gap-1.5 btn-primary text-sm py-1.5">
              <LogIn size={15} />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
