'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,       // data stays fresh for 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>FootballPredictor</title>
        <meta name="description" content="Predict football scores, track your accuracy, climb the leaderboard." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
        </QueryClientProvider>
      </body>
    </html>
  )
}
