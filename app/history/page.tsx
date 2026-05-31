'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Recipe } from '@/lib/types'
import Link from 'next/link'

export default function HistoryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recipes/history')
      .then(r => r.json())
      .then(d => { setRecipes(d.recipes ?? []); setLoading(false) })
  }, [])

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recipe History</h1>

        {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>}

        {!loading && recipes.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">🍽️</p>
            <p>No recipes selected yet. <Link href="/cook" className="text-orange-500 underline">Start cooking!</Link></p>
          </div>
        )}

        <div className="space-y-3">
          {recipes.map(recipe => {
            const session = (recipe as any).recipe_sessions
            return (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`} className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900">{recipe.dish_name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{recipe.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>🥘 {session?.key_ingredient}</span>
                      <span>⏱ {recipe.cook_time_minutes} min</span>
                      <span>🔥 {recipe.calories_per_person} cal</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 whitespace-nowrap ml-2">
                    {new Date(recipe.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
