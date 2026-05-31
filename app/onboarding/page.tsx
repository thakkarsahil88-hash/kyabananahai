'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SearchableChecklist } from '@/components/SearchableChecklist'
import { ALLERGENS, DIETARY_PREFS, DISLIKED_INGREDIENTS } from '@/lib/types'

export default function Onboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [allergens, setAllergens] = useState<string[]>([])
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([])
  const [cookWhatsapp, setCookWhatsapp] = useState('')
  const [userWhatsapp, setUserWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        allergens,
        dietary_prefs: dietaryPrefs,
        disliked_ingredients: dislikedIngredients,
        cook_whatsapp: cookWhatsapp,
        user_whatsapp: userWhatsapp,
        onboarding_complete: true,
      }),
    })
    router.push('/cook')
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {step === 1 && 'Allergies'}
          {step === 2 && 'Dietary Preferences'}
          {step === 3 && "Ingredients You Don't Like"}
          {step === 4 && 'WhatsApp Numbers'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {step < 4 ? 'You can update these anytime in Settings.' : 'Used to share recipes. You can update these later.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        {step === 1 && (
          <SearchableChecklist title="Allergens" allItems={ALLERGENS} selected={allergens} onChange={setAllergens} />
        )}
        {step === 2 && (
          <SearchableChecklist title="Dietary Preferences" allItems={DIETARY_PREFS} selected={dietaryPrefs} onChange={setDietaryPrefs} />
        )}
        {step === 3 && (
          <SearchableChecklist title="Disliked Ingredients" allItems={DISLIKED_INGREDIENTS} selected={dislikedIngredients} onChange={setDislikedIngredients} />
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Your WhatsApp number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={userWhatsapp}
                onChange={e => setUserWhatsapp(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Cook's WhatsApp number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={cookWhatsapp}
                onChange={e => setCookWhatsapp(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium">
            Back
          </button>
        )}
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Next
          </button>
        ) : (
          <button onClick={save} disabled={saving} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : "Let's Cook!"}
          </button>
        )}
      </div>
    </main>
  )
}
