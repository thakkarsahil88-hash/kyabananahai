'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'

function CookContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyIngredient, setKeyIngredient] = useState('')
  const [otherIngredients, setOtherIngredients] = useState('')
  const [avoidIngredients, setAvoidIngredients] = useState('')

  useEffect(() => {
    const avoid = searchParams.get('avoid')
    if (avoid) setAvoidIngredients(avoid)
  }, [searchParams])
  const [servings, setServings] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!keyIngredient.trim()) { setError('Please enter a key ingredient'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyIngredient: keyIngredient.trim(),
          otherIngredients: otherIngredients.split(',').map(s => s.trim()).filter(Boolean),
          avoidIngredients: avoidIngredients.split(',').map(s => s.trim()).filter(Boolean),
          servings,
          excludeDishes: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const params = new URLSearchParams({ sessionId: data.sessionId })
      router.push(`/recipes?${params}`)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">What do you have today?</h1>
          <p className="text-gray-500 text-sm mt-1">We'll suggest 5 recipes you can make.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700">Key Ingredient <span className="text-orange-500">*</span> <span className="text-gray-400 font-normal">(mandatory inclusion)</span></label>
            <input
              type="text"
              placeholder="e.g. Chicken, Paneer, Aloo..."
              value={keyIngredient}
              onChange={e => setKeyIngredient(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Other Ingredients Available <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Tomatoes, Onion, Ginger — comma separated"
              value={otherIngredients}
              onChange={e => setOtherIngredients(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Avoid Today <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Garlic, Oil — comma separated"
              value={avoidIngredients}
              onChange={e => setAvoidIngredients(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Number of People</label>
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => setServings(s => Math.max(1, s - 1))} className="w-9 h-9 rounded-full border border-gray-200 text-lg font-medium hover:bg-gray-50 transition-colors">−</button>
              <span className="text-xl font-bold text-orange-600 w-8 text-center">{servings}</span>
              <button onClick={() => setServings(s => Math.min(50, s + 1))} className="w-9 h-9 rounded-full border border-gray-200 text-lg font-medium hover:bg-gray-50 transition-colors">+</button>
              <span className="text-sm text-gray-500">{servings === 1 ? 'person' : 'people'}</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold text-base hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating recipes...
              </>
            ) : 'Suggest 5 Recipes'}
          </button>
        </div>
      </main>
    </>
  )
}

export default function CookPage() {
  return <Suspense><CookContent /></Suspense>
}
