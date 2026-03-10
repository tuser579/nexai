import NextAuth    from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google      from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
          const { connectDB } = await import('@/lib/db')
          const { default: User } = await import('@/models/User')

          await connectDB()

          const user = await User.findOne({
            email: String(credentials.email).toLowerCase().trim(),
          })

          if (!user) return null

          const isValid = await user.comparePassword(
            String(credentials.password)
          )
          if (!isValid) return null

          return {
            id:     user._id.toString(),
            email:  user.email,
            name:   user.name,
            plan:   user.plan   ?? 'free',
            avatar: user.avatar ?? '',
          }
        } catch (err) {
          console.error('Auth authorize error:', err)
          return null
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id     = user.id     ?? ''
        token.plan   = user.plan   ?? 'free'
        token.avatar = user.avatar ?? ''
        token.name   = user.name   ?? ''
      }

      if (account?.provider === 'google' && token.email) {
        try {
          const { connectDB }     = await import('@/lib/db')
          const { default: User } = await import('@/models/User')

          await connectDB()

          let dbUser = await User.findOne({ email: token.email })
          if (!dbUser) {
            dbUser = await User.create({
              name:     token.name    || 'User',
              email:    token.email,
              password: Math.random().toString(36).slice(-16) +
                        Math.random().toString(36).slice(-16),
              provider: 'google',
              avatar:   token.picture ?? '',
              plan:     'free',
            })
          }
          token.id     = dbUser._id.toString()
          token.plan   = dbUser.plan   ?? 'free'
          token.avatar = dbUser.avatar ?? ''
        } catch (err) {
          console.error('Google OAuth DB error:', err)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id     = token.id     ?? ''
        session.user.plan   = token.plan   ?? 'free'
        session.user.avatar = token.avatar ?? ''
        session.user.name   = token.name   ?? session.user.name ?? ''
      }
      return session
    },
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
})