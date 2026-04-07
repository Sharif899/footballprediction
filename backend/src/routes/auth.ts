import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma'

const router = Router()

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    // Basic validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username'
      return res.status(409).json({ error: `${field} already in use` })
    }

    // Hash password — cost 12 is strong but not too slow
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true },
    })

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Use generic message to not reveal whether email exists
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router

