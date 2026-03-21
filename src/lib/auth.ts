import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import prisma from '@/lib/db'
import { normalizePhone } from '@/lib/twilio-verify'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        verified: { label: 'Verified', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || credentials?.verified !== 'true') {
          return null
        }

        const phone = normalizePhone(credentials.phone as string)

        const user = await prisma.user.findUnique({
          where: { phone },
        })

        if (!user) {
          return null
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated. Please contact support.')
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email || user.phone,
          name: user.name,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string
        token.email = user.email as string
        token.name = user.name as string
        token.isSuperAdmin = (user as { isSuperAdmin: boolean }).isSuperAdmin
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.userId as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      session.user.isSuperAdmin = token.isSuperAdmin as boolean
      return session
    },
  },
})
