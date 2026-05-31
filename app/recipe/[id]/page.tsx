'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { RecipeImageCard } from '@/components/RecipeImageCard'
import { Recipe, LANGUAGES } from '@/lib/types'

interface IngredientModal {
  ingredient: string
  action: 'choose' | 'loading'
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [servings, setServings] = useState(2)
  const [langCode, setLangCode] = useState('en')
  const [translatedRecipe, setTranslatedRecipe] = useState<Recipe | null>(null)
  const [translating, setTranslating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [userWhatsapp, setUserWhatsapp] = useState('')
  const [cookWhatsapp, setCookWhatsapp] = useState('')
  const [modal, setModal] = useState<IngredientModal | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then(r => r.json())
      .then(d => {
        setRecipe(d.recipe)
        setServings(d.servings ?? 2)
        fetch(`/api/images/search?q=${encodeURIComponent(d.recipe.dish_name)}`)
          .then(r => r.json())
          .then(img => setImageUrl(img.url ?? null))
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

  const alterRecipe = async (action: 'substitute' | 'remove') => {
    if (!modal) return
    setModal({ ingredient: modal.ingredient, action: 'loading' })
    const res = await fetch('/api/recipes/alter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: id, missingIngredient: modal.ingredient, action }),
    })
    const data = await res.json()
    if (data.recipe) {
      setRecipe(data.recipe)
      setTranslatedRecipe(null)
      setLangCode('en')
    }
    setModal(null)
  }

  const goBackWithAvoid = () => {
    if (!modal) return
    setModal(null)
    router.push(`/cook?avoid=${encodeURIComponent(modal.ingredient)}`)
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
    const n = r.nutrition_per_person
    const lines = [
      `*${r.dish_name}*`,
      `_${r.description}_`,
      `⏱ ${r.cook_time_minutes} min | 🔥 ${r.calories_per_person} cal/person | 👥 ${servings} servings`,
      ...(n ? [`💪 Protein: ${n.protein_g}g | 🌾 Carbs: ${n.carbs_g}g | 🧈 Fat: ${n.fat_g}g | 🥦 Fibre: ${n.fiber_g}g`] : []),
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

        <button onClick={() => router.back()} className="text-sm text-orange-500 hover:underline">← Back to recipes</button>

        {/* Ingredient availability section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">Check your ingredients</h2>
          <p className="text-sm text-gray-400 mb-4">Tap any ingredient you don't have</p>
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-800">{ing.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{ing.quantity}</span>
                </div>
                <button
                  onClick={() => setModal({ ingredient: ing.name, action: 'choose' })}
                  className="text-xs px-2.5 py-1 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                >
                  Not available
                </button>
              </div>
            ))}
          </div>
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
            {displayRecipe && <RecipeImageCard recipe={displayRecipe} servings={servings} imageUrl={imageUrl} />}
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

      {/* Ingredient not available modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            {modal.action === 'loading' ? (
              <div className="p-8 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                <p className="text-gray-600 text-sm">Updating recipe...</p>
              </div>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4">
                  <h3 className="font-bold text-gray-900 text-lg">"{modal.ingredient}" not available</h3>
                  <p className="text-gray-500 text-sm mt-1">What would you like to do?</p>
                </div>
                <div className="px-4 pb-4 space-y-2">
                  <button
                    onClick={() => alterRecipe('substitute')}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors text-left px-4 flex items-center gap-3"
                  >
                    <span className="text-xl">🔄</span>
                    <div>
                      <p className="font-semibold">Substitute it</p>
                      <p className="text-xs text-orange-100">Replace with a similar ingredient</p>
                    </div>
                  </button>
                  <button
                    onClick={() => alterRecipe('remove')}
                    className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-left px-4 flex items-center gap-3"
                  >
                    <span className="text-xl">✂️</span>
                    <div>
                      <p className="font-semibold">Remove it</p>
                      <p className="text-xs text-gray-500">Adjust recipe without this ingredient</p>
                    </div>
                  </button>
                  <button
                    onClick={goBackWithAvoid}
                    className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-left px-4 flex items-center gap-3"
                  >
                    <span className="text-xl">↩️</span>
                    <div>
                      <p className="font-semibold">Go back & avoid it</p>
                      <p className="text-xs text-gray-500">Return to suggestions, pre-filled as avoid</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setModal(null)}
                    className="w-full py-2.5 text-gray-400 text-sm hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
