import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipeId } = await req.json()

  const admin = supabaseAdmin()
  const { data: recipe } = await admin
    .from('recipes')
    .select('*, recipe_sessions(key_ingredient, other_ingredients, avoid_ingredients, servings)')
    .eq('id', recipeId)
    .single()

  if (!recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  // Already expanded
  if (recipe.ingredients?.length > 0) return NextResponse.json({ recipe })

  const s = (recipe as any).recipe_sessions
  const { data: user } = await admin.from('users').select('allergens,dietary_prefs,disliked_ingredients').eq('email', session.user.email).single()

  const prompt = `Generate complete ingredients and step-by-step instructions for this recipe.

Dish: ${recipe.dish_name}
Description: ${recipe.description}
Key ingredient (MUST include): ${s?.key_ingredient}
${recipe.uses_other_ingredients && s?.other_ingredients?.length > 0 ? `Other ingredients to use: ${s.other_ingredients.join(', ')}` : ''}
Servings: ${s?.servings ?? 2}
Allergens to avoid: ${(user as any)?.allergens?.join(', ') || 'none'}
Dietary: ${(user as any)?.dietary_prefs?.join(', ') || 'none'}

Return JSON with exactly these fields:
{
  "ingredients": [{"name": "string", "quantity": "string"}],
  "steps": ["step 1", "step 2", ...]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a cooking assistant. Respond ONLY with valid JSON.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  let details
  try {
    details = JSON.parse(completion.choices[0].message.content!)
  } catch {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 })
  }

  const { data: updated } = await admin
    .from('recipes')
    .update({ ingredients: details.ingredients, steps: details.steps })
    .eq('id', recipeId)
    .select()
    .single()

  return NextResponse.json({ recipe: updated })
}
