'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Recipe } from '@/lib/types'
import Link from 'next/link'

type Tab = 'history' | 'saved'

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const session = (recipe as any).recipe_sessions
  return (
    <Link href={`/recipe/${recipe.id}`} className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 truncate">{recipe.dish_name}</h2>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{recipe.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
            <span>⏱ {recipe.cook_time_minutes} min</span>
            <span>🔥 {recipe.calories_per_person} cal</span>
            {recipe.difficulty && <span className={`px-1.5 py-0.5 rounded-full font-medium ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-600' : recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{recipe.difficulty}</span>}
          </div>
        </div>
        <span className="text-xs text-gray-300 whitespace-nowrap ml-3 mt-1">
          {new Date(recipe.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </Link>
  )
}

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('history')
  const [history, setHistory] = useState<Recipe[]>([])
  const [saved, setSaved] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/recipes/history').then(r => r.json()),
      fetch('/api/recipes/saved').then(r => r.json()),
    ]).then(([h, s]) => {
      setHistory(h.recipes ?? [])
      setSaved(s.recipes ?? [])
      setLoading(false)
    })
  }, [])

  // Group saved recipes by key ingredient
  const savedGrouped = saved.reduce((acc, recipe) => {
    const key = (recipe as any).recipe_sessions?.key_ingredient ?? 'Other'
    const k = key.charAt(0).toUpperCase() + key.slice(1)
    if (!acc[k]) acc[k] = []
    acc[k].push(recipe)
    return acc
  }, {} as Record<string, Recipe[]>)

  const unsave = async (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(prev => prev.filter(r => r.id !== recipe.id))
    await fetch('/api/recipes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: recipe.id, saved: false }),
    })
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">Your Recipes</h1>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'history' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🕐 History {history.length > 0 && <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{history.length}</span>}
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'saved' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔖 Saved {saved.length > 0 && <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{saved.length}</span>}
          </button>
        </div>

        {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}

        {/* History tab */}
        {!loading && tab === 'history' && (
          <>
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-3">🍽️</p>
                <p>No recipes selected yet. <Link href="/cook" className="text-orange-500 underline">Start cooking!</Link></p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(recipe => <RecipeRow key={recipe.id} recipe={recipe} />)}
              </div>
            )}
          </>
        )}

        {/* Saved tab */}
        {!loading && tab === 'saved' && (
          <>
            {saved.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-3">🔖</p>
                <p>No saved recipes yet.<br />Tap 🔖 on any recipe to save it.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(savedGrouped).map(([ingredient, recipes]) => (
                  <div key={ingredient}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">{ingredient}</span>
                      <div className="flex-1 h-px bg-orange-100" />
                      <span className="text-xs text-gray-400">{recipes.length} recipe{recipes.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-3">
                      {recipes.map(recipe => (
                        <div key={recipe.id} className="relative">
                          <RecipeRow recipe={recipe} />
                          <button
                            onClick={(e) => unsave(e, recipe)}
                            className="absolute top-3 right-3 text-xs text-gray-300 hover:text-red-400 transition-colors"
                            title="Remove from saved"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
