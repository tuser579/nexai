import NextAuth          from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider    from 'next-auth/providers/google'
import { connectDB }     from '@/lib/db'
import User              from '@/models/User'
import { handlers } from '@/auth'


const handler = NextAuth({
  providers: [

    // ── Google OAuth ─────────────────────────
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // ── Email + Password ─────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          await connectDB()

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          })

          if (!user) {
            throw new Error('No account found with this email')
          }

          const isValid = await user.comparePassword(credentials.password)
          if (!isValid) {
            throw new Error('Incorrect password')
          }

          await User.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
          })

          return {
            id:     user._id.toString(),
            name:   user.name,
            email:  user.email,
            plan:   user.plan,
            avatar: user.avatar,
          }
        } catch (err) {
          throw new Error(err.message || 'Authentication failed')
        }
      },
    }),
  ],

  callbacks: {

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          const existing = await User.findOne({ email: user.email })
          if (!existing) {
            await User.create({
              name:     user.name,
              email:    user.email,
              avatar:   user.image,
              password: Math.random().toString(36) + Date.now().toString(),
              provider: 'google',
            })
          } else {
            if (!existing.avatar && user.image) {
              await User.findByIdAndUpdate(existing._id, {
                avatar:      user.image,
                lastLoginAt: new Date(),
              })
            }
          }
          return true
        } catch (err) {
          console.error('Google signIn error:', err)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: user.email || token.email })
          if (dbUser) {
            token.id     = dbUser._id.toString()
            token.plan   = dbUser.plan
            token.avatar = dbUser.avatar || user.image || ''
            token.name   = dbUser.name
          }
        } catch (err) {
          console.error('JWT callback error:', err)
        }
      }

      if (trigger === 'update') {
        try {
          await connectDB()
          const dbUser = await User.findById(token.id)
          if (dbUser) {
            token.name   = dbUser.name
            token.avatar = dbUser.avatar
            token.plan   = dbUser.plan
          }
        } catch (err) {
          console.error('JWT update error:', err)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id     = token.id     ?? ''
        session.user.plan   = token.plan   ?? 'free'
        session.user.avatar = token.avatar ?? ''
        session.user.name   = token.name   ?? session.user.name
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  debug: process.env.NODE_ENV === 'development',
})

export const { GET, POST } = handlers