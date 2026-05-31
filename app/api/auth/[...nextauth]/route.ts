import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const admin = supabaseAdmin()
      const { data } = await admin
        .from('users')
        .select('id')
        .eq('email', user.email!)
        .single()

      if (!data) {
        await admin.from('users').insert({
          email: user.email,
          name: user.name,
          avatar_url: user.image,
          allergens: [],
          dietary_prefs: [],
          disliked_ingredients: [],
          onboarding_complete: false,
        })
      }
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        const admin = supabaseAdmin()
        const { data } = await admin
          .from('users')
          .select('id, onboarding_complete')
          .eq('email', session.user.email)
          .single()
        if (data) {
          (session.user as any).id = data.id;
          (session.user as any).onboarding_complete = data.onboarding_complete
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
