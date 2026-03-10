import NextAuth      from 'next-auth'
import Credentials   from 'next-auth/providers/credentials'
import Google        from 'next-auth/providers/google'
import { connectDB } from '@/lib/db'
import User          from '@/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [

    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          await connectDB()
          const user = await User.findOne({
            email: String(credentials.email).toLowerCase(),
          })
          if (!user) return null
          const isValid = await user.comparePassword(String(credentials.password))
          if (!isValid) return null
          return {
            id:     user._id.toString(),
            name:   user.name,
            email:  user.email,
            plan:   user.plan   || 'free',
            avatar: user.avatar || '',
          }
        } catch (err) {
          console.error('Auth error:', err)
          return null
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
              avatar:   user.image || '',
              password: Math.random().toString(36) + Date.now().toString(),
              provider: 'google',
            })
          }
          return true
        } catch (err) {
          console.error('Google signIn error:', err)
          return false
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: user.email })
          if (dbUser) {
            token.id     = dbUser._id.toString()
            token.plan   = dbUser.plan   || 'free'
            token.avatar = dbUser.avatar || ''
            token.name   = dbUser.name
          }
        } catch (err) {
          console.error('JWT error:', err)
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
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

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  trustHost: true,

  secret: process.env.AUTH_SECRET,
})