'use client'
import { useState } from 'react'

interface Props {
  title: string
  allItems: string[]
  selected: string[]
  onChange: (items: string[]) => void
}

export function SearchableChecklist({ title, allItems, selected, onChange }: Props) {
  const [query, setQuery] = useState('')

  const filtered = allItems.filter(item => item.toLowerCase().includes(query.toLowerCase()))

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(i => i !== item))
    } else {
      onChange([...selected, item])
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(item => (
            <span key={item} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {item}
              <button onClick={() => toggle(item)} className="hover:text-orange-900">×</button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder={`Search ${title.toLowerCase()}...`}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
        {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No results</p>}
        {filtered.map(item => (
          <label key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => toggle(item)}
              className="accent-orange-500"
            />
            <span className="text-sm text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
