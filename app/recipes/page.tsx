'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Recipe } from '@/lib/types'
import Link from 'next/link'

function RecipesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [excludedDishes, setExcludedDishes] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>([])

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/recipes/session?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => setRecipes(d.recipes ?? []))
  }, [sessionId])

  const loadMore = async () => {
    setLoadingMore(true)
    const allShown = [...excludedDishes, ...recipes.map(r => r.dish_name)]
    const res = await fetch('/api/recipes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyIngredient: recipes[0]?.dish_name ?? '',
        otherIngredients: [],
        avoidIngredients: [],
        servings: 2,
        excludeDishes: allShown,
        refSessionId: sessionId,
      }),
    })
    const data = await res.json()
    setRecipes(data.recipes ?? [])
    setExcludedDishes(allShown)
    const params = new URLSearchParams({ sessionId: data.sessionId })
    router.replace(`/recipes?${params}`)
    setLoadingMore(false)
  }

  const neverShow = async (recipe: Recipe) => {
    setHidden(prev => [...prev, recipe.id])
    await fetch('/api/recipes/never-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishName: recipe.dish_name }),
    })
  }

  const selectRecipe = async (recipe: Recipe) => {
    await fetch('/api/recipes/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: recipe.id }),
    })
    router.push(`/recipe/${recipe.id}`)
  }

  const visible = recipes.filter(r => !hidden.includes(r.id))

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">5 Recipes for You</h1>
          <Link href="/cook" className="text-sm text-orange-500 hover:underline">← Change</Link>
        </div>

        {visible.length === 0 && !loadingMore && (
          <div className="text-center text-gray-400 py-12">No recipes to show. Try generating more.</div>
        )}

        <div className="space-y-3">
          {visible.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 text-lg">{recipe.dish_name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">{recipe.description}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><span className="text-base">🔥</span> {recipe.calories_per_person} cal/person</span>
                    <span className="flex items-center gap-1 text-gray-600"><span className="text-base">⏱</span> {recipe.cook_time_minutes} min</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => selectRecipe(recipe)}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Select This Recipe
                </button>
                <button
                  onClick={() => neverShow(recipe)}
                  title="Never show this again"
                  className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-colors"
                >
                  🚫
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-3 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500" /> Getting 5 more...</>
          ) : 'Suggest 5 More'}
        </button>
      </main>
    </>
  )
}

export default function RecipesPage() {
  return (
    <Suspense>
      <RecipesContent />
    </Suspense>
  )
}
