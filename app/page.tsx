'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      const user = session.user as any
      router.replace(user.onboarding_complete ? '/cook' : '/onboarding')
    }
  }, [session, status, router])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">क्या बनाना है?</h1>
          <p className="text-xl text-gray-600 mt-2">Kya Banana Hai</p>
          <p className="text-gray-500 mt-4">Tell your cook exactly what to make — with step-by-step recipes in any language.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-left bg-white rounded-xl p-4 shadow-sm">
            <span className="text-2xl">🥘</span>
            <p className="text-sm text-gray-600">Enter what you have. Get 5 recipe ideas instantly.</p>
          </div>
          <div className="flex items-center gap-3 text-left bg-white rounded-xl p-4 shadow-sm">
            <span className="text-2xl">📲</span>
            <p className="text-sm text-gray-600">Download a recipe card or send it to your cook on WhatsApp.</p>
          </div>
          <div className="flex items-center gap-3 text-left bg-white rounded-xl p-4 shadow-sm">
            <span className="text-2xl">🌐</span>
            <p className="text-sm text-gray-600">Recipes in 10 languages — English, Hindi, Bengali &amp; more.</p>
          </div>
        </div>

        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  )
}
