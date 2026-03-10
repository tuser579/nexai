import { NextResponse } from 'next/server'
import { connectDB }    from '@/lib/db'
import User             from '@/models/User'

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // ── Validate fields ──────────────────────────
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // ── Check if email already exists ────────────
    const existing = await User.findOne({
      email: email.toLowerCase(),
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // ── Create user ──────────────────────────────
    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase(),
      password: password,
      provider: 'email',       // ← was 'credentials', now 'email'
      plan:     'free',
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          plan:  user.plan,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: err.message || 'Registration failed' },
      { status: 500 }
    )
  }
}