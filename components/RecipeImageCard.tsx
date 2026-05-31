'use client'
import { Recipe } from '@/lib/types'

interface Props {
  recipe: Recipe
  servings: number
}

export function RecipeImageCard({ recipe, servings }: Props) {
  return (
    <div
      id="recipe-card"
      className="bg-white w-[600px] font-sans"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-orange-500 px-8 py-6">
        <p className="text-orange-100 text-sm font-medium uppercase tracking-widest mb-1">क्या बनाना है?</p>
        <h1 className="text-white text-3xl font-bold leading-tight">{recipe.dish_name}</h1>
        <p className="text-orange-100 text-sm mt-2">{recipe.description}</p>
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-white text-xl font-bold">{recipe.calories_per_person}</p>
            <p className="text-orange-200 text-xs">cal / person</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{recipe.cook_time_minutes}</p>
            <p className="text-orange-200 text-xs">minutes</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{servings}</p>
            <p className="text-orange-200 text-xs">servings</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{recipe.difficulty}</p>
            <p className="text-orange-200 text-xs">difficulty</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-2 gap-6">
        {/* Ingredients */}
        <div>
          <h2 className="text-gray-900 font-bold text-base mb-3 uppercase tracking-wide text-xs text-orange-600">Ingredients</h2>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                <span className="text-gray-800">{ing.name}</span>
                <span className="text-gray-500 font-medium">{ing.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-gray-900 font-bold text-base mb-3 uppercase tracking-wide text-xs text-orange-600">Steps</h2>
          <div className="space-y-3">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 pb-4 text-xs text-gray-300 text-right">kyabananahai.com</div>
    </div>
  )
}
