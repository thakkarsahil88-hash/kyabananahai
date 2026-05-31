import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keyIngredient, otherIngredients, avoidIngredients, servings, excludeDishes, refSessionId } = await req.json()

  // When requesting "5 more", pull original session data
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

  const systemPrompt = `You are a helpful cooking assistant. Generate recipe suggestions based on the user's ingredients and preferences. Respond ONLY with valid JSON, no markdown, no explanation.`

  const userPrompt = `Generate ${hasOtherIngredients ? '8' : '5'} recipes.

Key ingredient: ${resolvedKey}
${hasOtherIngredients ? `Other available ingredients: ${resolvedOther.join(', ')}` : ''}
Ingredients to avoid today: ${resolvedAvoid?.join(', ') || 'none'}
Cooking for: ${resolvedServings} people
User allergens: ${user.allergens?.join(', ') || 'none'}
Dietary preferences: ${user.dietary_prefs?.join(', ') || 'none'}
Disliked ingredients: ${user.disliked_ingredients?.join(', ') || 'none'}
${allExclude.length > 0 ? `Do NOT suggest these dishes: ${allExclude.join(', ')}` : ''}

${hasOtherIngredients ? `Return exactly 8 recipes:
- First 5 recipes MUST use the key ingredient AND incorporate the other available ingredients creatively.
- Last 3 recipes MUST use ONLY the key ingredient (ignore the other ingredients for these 3).
- Add a field "uses_other_ingredients": true for the first 5, and false for the last 3.` : `Return exactly 5 recipes using only the key ingredient.`}

JSON structure for each recipe:
{
  "dish_name": "string",
  "description": "one sentence description",
  "calories_per_person": number,
  "cook_time_minutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "uses_other_ingredients": boolean,
  "ingredients": [{"name": "string", "quantity": "string"}],
  "steps": ["step 1 text", "step 2 text", ...]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
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
    ingredients: r.ingredients,
    steps: r.steps,
  }))

  const { data: savedRecipes } = await admin.from('recipes').insert(toInsert).select()

  return NextResponse.json({ recipes: savedRecipes, sessionId: recipeSession.id })
}
