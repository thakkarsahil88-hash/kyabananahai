'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { RecipeImageCard } from '@/components/RecipeImageCard'
import { Recipe, LANGUAGES } from '@/lib/types'

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [servings, setServings] = useState(2)
  const [langCode, setLangCode] = useState('en')
  const [translatedRecipe, setTranslatedRecipe] = useState<Recipe | null>(null)
  const [translating, setTranslating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [userWhatsapp, setUserWhatsapp] = useState('')
  const [cookWhatsapp, setCookWhatsapp] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then(r => r.json())
      .then(d => {
        setRecipe(d.recipe)
        setServings(d.servings ?? 2)
      })
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        setUserWhatsapp(d.user?.user_whatsapp ?? '')
        setCookWhatsapp(d.user?.cook_whatsapp ?? '')
      })
  }, [id])

  const translate = async (code: string) => {
    setLangCode(code)
    if (code === 'en') { setTranslatedRecipe(null); return }
    setTranslating(true)
    const res = await fetch('/api/recipes/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, languageCode: code }),
    })
    const data = await res.json()
    setTranslatedRecipe(data.recipe)
    setTranslating(false)
  }

  const downloadCard = async () => {
    setDownloading(true)
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('recipe-card')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = `${(displayRecipe?.dish_name ?? 'recipe').replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloading(false)
  }

  const whatsappText = () => {
    const r = displayRecipe
    if (!r) return ''
    const lines = [
      `*${r.dish_name}*`,
      `_${r.description}_`,
      `⏱ ${r.cook_time_minutes} min | 🔥 ${r.calories_per_person} cal/person | 👥 ${servings} servings`,
      '',
      '*Ingredients:*',
      ...r.ingredients.map(i => `• ${i.name} — ${i.quantity}`),
      '',
      '*Steps:*',
      ...r.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      '_Sent via KyaBananaHai_',
    ]
    return lines.join('\n')
  }

  const displayRecipe = translatedRecipe ?? recipe

  if (!recipe) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
    </>
  )

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm text-orange-500 hover:underline">← Back to recipes</button>
        </div>

        {/* Language selector */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Recipe language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => translate(lang.code)}
                disabled={translating}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${langCode === lang.code ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {translating && <p className="text-sm text-gray-400 mt-2">Translating...</p>}
        </div>

        {/* Recipe card preview */}
        <div className="overflow-x-auto">
          <div ref={cardRef}>
            {displayRecipe && <RecipeImageCard recipe={displayRecipe} servings={servings} />}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={downloadCard}
            disabled={downloading || translating}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {downloading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Generating image...</> : '⬇️ Download Recipe Card'}
          </button>

          {userWhatsapp && (
            <a
              href={`https://wa.me/${userWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-center"
            >
              💬 Send to My WhatsApp
            </a>
          )}

          {cookWhatsapp && (
            <a
              href={`https://wa.me/${cookWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-center"
            >
              👨‍🍳 Send to Cook's WhatsApp
            </a>
          )}

          {!userWhatsapp && !cookWhatsapp && (
            <p className="text-sm text-gray-400 text-center">Add WhatsApp numbers in <a href="/settings" className="text-orange-500 underline">Settings</a> to share directly.</p>
          )}
        </div>
      </main>
    </>
  )
}
