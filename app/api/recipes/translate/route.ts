import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openai } from '@/lib/openai'
import { LANGUAGES } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipe, languageCode } = await req.json()

  if (languageCode === 'en') return NextResponse.json({ recipe })

  const langLabel = LANGUAGES.find(l => l.code === languageCode)?.label ?? 'Hindi'

  const prompt = `Translate the following recipe into ${langLabel}. Keep ingredient names in both ${langLabel} and English (e.g. "Pyaaz / Onion"). Translate all other text fully. Return valid JSON in the exact same structure as the input.

Input:
${JSON.stringify(recipe, null, 2)}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  let translated
  try {
    translated = JSON.parse(completion.choices[0].message.content!)
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }

  return NextResponse.json({ recipe: translated })
}
