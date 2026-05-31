import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyIngredient, otherIngredients, avoidIngredients, servings, excludeDishes, refSessionId } = await req.json()

  let resolvedKey = keyIngredient
  let resolvedOther = otherIngredients ?? []
  let resolvedAvoid = avoidIngredients ?? []
  let resolvedServings = servings ?? 2

  if (refSessionId) {
    const admin2 = supabaseAdmin()
    const { data: origSession } = await admin2.from('recipe_sessions').select('*').eq('id', refSessionId).single()
    if (origSession) {
      resolvedKey = origSession.key_ingredient
      resolvedOther = origSession.other_ingredients
      resolvedAvoid = origSession.avoid_ingredients
      resolvedServings = origSession.servings
    }
  }

  const admin = supabaseAdmin()
  const { data: user } = await admin.from('users').select('*').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: neverShow } = await admin.from('never_show').select('dish_name').eq('user_id', user.id)
  const neverShowList = neverShow?.map((r: any) => r.dish_name) ?? []
  const allExclude = [...neverShowList, ...(excludeDishes ?? [])]

  const hasOtherIngredients = resolvedOther && resolvedOther.length > 0
  const count = hasOtherIngredients ? 8 : 5

  // PHASE 1: generate summaries only (no ingredients, no steps) — very fast
  const previewPrompt = `Generate ${count} recipe summaries. Be concise.

Key ingredient (MUST be included): ${resolvedKey}
${hasOtherIngredients ? `Other ingredients to use: ${resolvedOther.join(', ')}` : ''}
Avoid: ${resolvedAvoid?.join(', ') || 'none'}
Servings: ${resolvedServings}
Allergens: ${user.allergens?.join(', ') || 'none'}
Dietary: ${user.dietary_prefs?.join(', ') || 'none'}
Disliked: ${user.disliked_ingredients?.join(', ') || 'none'}
${allExclude.length > 0 ? `Do NOT suggest: ${allExclude.join(', ')}` : ''}

${hasOtherIngredients ? `First 5 MUST use key ingredient + other ingredients. Last 3 use key ingredient only. Set uses_other_ingredients accordingly.` : ''}

Return JSON array of ${count} objects, each with ONLY these fields:
{ "dish_name": string, "description": string (1 sentence), "calories_per_person": number, "cook_time_minutes": number, "difficulty": "Easy"|"Medium"|"Hard", "uses_other_ingredients": boolean, "nutrition_per_person": { "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number } }`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a cooking assistant. Respond ONLY with valid JSON.' },
      { role: 'user', content: previewPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  let recipes
  try {
    const parsed = JSON.parse(completion.choices[0].message.content!)
    recipes = Array.isArray(parsed) ? parsed : parsed.recipes ?? parsed.items ?? Object.values(parsed)[0]
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const { data: recipeSession } = await admin.from('recipe_sessions').insert({
    user_id: user.id,
    key_ingredient: resolvedKey,
    other_ingredients: resolvedOther,
    avoid_ingredients: resolvedAvoid,
    servings: resolvedServings,
  }).select().single()

  const toInsert = recipes.map((r: any) => ({
    session_id: recipeSession.id,
    user_id: user.id,
    dish_name: r.dish_name,
    description: r.description,
    calories_per_person: r.calories_per_person,
    cook_time_minutes: r.cook_time_minutes,
    difficulty: r.difficulty,
    uses_other_ingredients: r.uses_other_ingredients ?? false,
    nutrition_per_person: r.nutrition_per_person ?? null,
    ingredients: [],   // filled on demand in phase 2
    steps: [],
  }))

  const { data: savedRecipes } = await admin.from('recipes').insert(toInsert).select()

  return NextResponse.json({ recipes: savedRecipes, sessionId: recipeSession.id })
}
