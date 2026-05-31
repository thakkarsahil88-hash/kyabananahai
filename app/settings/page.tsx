'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { SearchableChecklist } from '@/components/SearchableChecklist'
import { ALLERGENS, DIETARY_PREFS, DISLIKED_INGREDIENTS } from '@/lib/types'

export default function SettingsPage() {
  const [allergens, setAllergens] = useState<string[]>([])
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>([])
  const [cookWhatsapp, setCookWhatsapp] = useState('')
  const [userWhatsapp, setUserWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        const u = d.user
        setAllergens(u?.allergens ?? [])
        setDietaryPrefs(u?.dietary_prefs ?? [])
        setDislikedIngredients(u?.disliked_ingredients ?? [])
        setCookWhatsapp(u?.cook_whatsapp ?? '')
        setUserWhatsapp(u?.user_whatsapp ?? '')
        setLoading(false)
      })
  }, [])

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
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
    </>
  )

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-6">
          <SearchableChecklist title="Allergens" allItems={ALLERGENS} selected={allergens} onChange={setAllergens} />
          <hr className="border-gray-100" />
          <SearchableChecklist title="Dietary Preferences" allItems={DIETARY_PREFS} selected={dietaryPrefs} onChange={setDietaryPrefs} />
          <hr className="border-gray-100" />
          <SearchableChecklist title="Disliked Ingredients" allItems={DISLIKED_INGREDIENTS} selected={dislikedIngredients} onChange={setDislikedIngredients} />
          <hr className="border-gray-100" />
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">WhatsApp Numbers</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">Your number</label>
              <input type="tel" value={userWhatsapp} onChange={e => setUserWhatsapp(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Cook's number</label>
              <input type="tel" value={cookWhatsapp} onChange={e => setCookWhatsapp(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </main>
    </>
  )
}
