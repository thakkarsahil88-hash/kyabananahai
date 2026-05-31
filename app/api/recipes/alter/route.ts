import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipeId, missingIngredient, action } = await req.json()
  // action: 'substitute' | 'remove'

  const admin = supabaseAdmin()
  const { data: recipe } = await admin.from('recipes').select('*').eq('id', recipeId).single()
  if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const prompt = action === 'substitute'
    ? `You are a cooking assistant. Modify this recipe by substituting "${missingIngredient}" with a reasonable alternative ingredient that would work well. Keep the dish name and overall concept the same. Update the ingredients list, quantities, and steps accordingly. Return the complete modified recipe as JSON.`
    : `You are a cooking assistant. Modify this recipe by removing "${missingIngredient}" entirely. Adjust the recipe so it still works well without it. Update the ingredients list and steps accordingly. Return the complete modified recipe as JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: `Current recipe:\n${JSON.stringify({
        dish_name: recipe.dish_name,
        description: recipe.description,
        calories_per_person: recipe.calories_per_person,
        cook_time_minutes: recipe.cook_time_minutes,
        difficulty: recipe.difficulty,
        nutrition_per_person: recipe.nutrition_per_person,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      }, null, 2)}\n\nReturn the full updated recipe in the exact same JSON structure. Include updated nutrition_per_person estimates.` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  let updated: any
  try {
    updated = JSON.parse(completion.choices[0].message.content!)
  } catch {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }

  const { data: updatedRecipe } = await admin
    .from('recipes')
    .update({
      dish_name: updated.dish_name ?? recipe.dish_name,
      description: updated.description ?? recipe.description,
      calories_per_person: updated.calories_per_person ?? recipe.calories_per_person,
      cook_time_minutes: updated.cook_time_minutes ?? recipe.cook_time_minutes,
      difficulty: updated.difficulty ?? recipe.difficulty,
      nutrition_per_person: updated.nutrition_per_person ?? recipe.nutrition_per_person,
      ingredients: updated.ingredients ?? recipe.ingredients,
      steps: updated.steps ?? recipe.steps,
    })
    .eq('id', recipeId)
    .select()
    .single()

  return NextResponse.json({ recipe: updatedRecipe })
}
