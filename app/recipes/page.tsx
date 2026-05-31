'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Recipe } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

function RecipeCard({ recipe, onSelect, onNeverShow }: {
  recipe: Recipe & { imageUrl?: string | null }
  onSelect: (r: Recipe) => void
  onNeverShow: (r: Recipe) => void
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {recipe.imageUrl && (
        <div className="relative h-40 w-full">
          <Image src={recipe.imageUrl} alt={recipe.dish_name} fill className="object-cover" />
        </div>
      )}
      <div className="p-5">
        <h2 className="font-bold text-gray-900 text-lg">{recipe.dish_name}</h2>
        <p className="text-gray-500 text-sm mt-0.5">{recipe.description}</p>
        <div className="flex gap-4 mt-3 text-sm flex-wrap">
          <span className="flex items-center gap-1 text-gray-600">🔥 {recipe.calories_per_person} cal/person</span>
          <span className="flex items-center gap-1 text-gray-600">⏱ {recipe.cook_time_minutes} min</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {recipe.difficulty}
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSelect(recipe)}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            Select This Recipe
          </button>
          <button
            onClick={() => onNeverShow(recipe)}
            title="Never show this again"
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-colors"
          >
            🚫
          </button>
        </div>
      </div>
    </div>
  )
}

function RecipesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [imageMap, setImageMap] = useState<Record<string, string | null>>({})
  const [loadingMore, setLoadingMore] = useState(false)
  const [excludedDishes, setExcludedDishes] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>([])

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/recipes/session?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        const loaded: Recipe[] = d.recipes ?? []
        setRecipes(loaded)
        fetchImages(loaded)
      })
  }, [sessionId])

  const fetchImages = async (list: Recipe[]) => {
    const results: Record<string, string | null> = {}
    await Promise.all(
      list.map(async (r) => {
        try {
          const res = await fetch(`/api/images/search?q=${encodeURIComponent(r.dish_name)}`)
          const data = await res.json()
          results[r.id] = data.url ?? null
        } catch {
          results[r.id] = null
        }
      })
    )
    setImageMap(prev => ({ ...prev, ...results }))
  }

  const loadMore = async () => {
    setLoadingMore(true)
    const allShown = [...excludedDishes, ...recipes.map(r => r.dish_name)]
    const res = await fetch('/api/recipes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyIngredient: '',
        otherIngredients: [],
        avoidIngredients: [],
        servings: 2,
        excludeDishes: allShown,
        refSessionId: sessionId,
      }),
    })
    const data = await res.json()
    const newRecipes: Recipe[] = data.recipes ?? []
    setRecipes(newRecipes)
    setExcludedDishes(allShown)
    setHidden([])
    fetchImages(newRecipes)
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
  const withOthers = visible.filter(r => r.uses_other_ingredients)
  const keyOnly = visible.filter(r => !r.uses_other_ingredients)
  const hasGroups = withOthers.length > 0 && keyOnly.length > 0

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Recipes</h1>
          <Link href="/cook" className="text-sm text-orange-500 hover:underline">← Change</Link>
        </div>

        {visible.length === 0 && !loadingMore && (
          <div className="text-center text-gray-400 py-12">No recipes to show.</div>
        )}

        {hasGroups ? (
          <>
            <div>
              <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">
                Using all your ingredients ({withOthers.length})
              </h2>
              <div className="space-y-4">
                {withOthers.map(r => (
                  <RecipeCard key={r.id} recipe={{ ...r, imageUrl: imageMap[r.id] }} onSelect={selectRecipe} onNeverShow={neverShow} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Key ingredient only ({keyOnly.length})
              </h2>
              <div className="space-y-4">
                {keyOnly.map(r => (
                  <RecipeCard key={r.id} recipe={{ ...r, imageUrl: imageMap[r.id] }} onSelect={selectRecipe} onNeverShow={neverShow} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {visible.map(r => (
              <RecipeCard key={r.id} recipe={{ ...r, imageUrl: imageMap[r.id] }} onSelect={selectRecipe} onNeverShow={neverShow} />
            ))}
          </div>
        )}

        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-3 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500" /> Getting more recipes...</>
          ) : 'Suggest More Recipes'}
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
