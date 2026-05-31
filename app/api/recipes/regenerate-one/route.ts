import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipeId, sessionId, excludeDishes } = await req.json()

  const admin = supabaseAdmin()
  const { data: user } = await admin.from('users').select('*').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Get original session info
  const { data: origSession } = await admin.from('recipe_sessions').select('*').eq('id', sessionId).single()
  if (!origSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  // Get the recipe being replaced to know if it used other ingredients
  const { data: oldRecipe } = await admin.from('recipes').select('uses_other_ingredients').eq('id', recipeId).single()

  const { data: neverShow } = await admin.from('never_show').select('dish_name').eq('user_id', user.id)
  const neverShowList = neverShow?.map((r: any) => r.dish_name) ?? []
  const allExclude = [...neverShowList, ...(excludeDishes ?? [])]

  const usesOther = oldRecipe?.uses_other_ingredients ?? false
  const hasOtherIngredients = origSession.other_ingredients?.length > 0

  const prompt = `Generate exactly 1 recipe.

Key ingredient: ${origSession.key_ingredient}
${usesOther && hasOtherIngredients ? `Other available ingredients: ${origSession.other_ingredients.join(', ')}` : 'Use ONLY the key ingredient, ignore any other ingredients.'}
Ingredients to avoid: ${origSession.avoid_ingredients?.join(', ') || 'none'}
Cooking for: ${origSession.servings} people
User allergens: ${user.allergens?.join(', ') || 'none'}
Dietary preferences: ${user.dietary_prefs?.join(', ') || 'none'}
Disliked ingredients: ${user.disliked_ingredients?.join(', ') || 'none'}
Do NOT suggest these dishes: ${allExclude.join(', ')}

Return a JSON object (not array) with this structure:
{
  "dish_name": "string",
  "description": "one sentence description",
  "calories_per_person": number,
  "cook_time_minutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "uses_other_ingredients": ${usesOther},
  "nutrition_per_person": { "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number },
  "ingredients": [{"name": "string", "quantity": "string"}],
  "steps": ["step 1", "step 2", ...]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful cooking assistant. Respond ONLY with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
  })

  let r: any
  try {
    r = JSON.parse(completion.choices[0].message.content!)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Delete old recipe and insert new one
  await admin.from('recipes').delete().eq('id', recipeId)

  const { data: newRecipe } = await admin.from('recipes').insert({
    session_id: sessionId,
    user_id: user.id,
    dish_name: r.dish_name,
    description: r.description,
    calories_per_person: r.calories_per_person,
    cook_time_minutes: r.cook_time_minutes,
    difficulty: r.difficulty,
    uses_other_ingredients: usesOther,
    nutrition_per_person: r.nutrition_per_person ?? null,
    ingredients: r.ingredients,
    steps: r.steps,
  }).select().single()

  return NextResponse.json({ recipe: newRecipe })
}
