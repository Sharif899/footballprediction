'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from './api'

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fp_token')
    const savedUser  = localStorage.getItem('fp_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('fp_token', data.token)
    localStorage.setItem('fp_user', JSON.stringify(data.user))
  }

  const register = async (email: string, username: string, password: string) => {
    const data = await authApi.register({ email, username, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('fp_token', data.token)
    localStorage.setItem('fp_user', JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('fp_token')
    localStorage.removeItem('fp_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
