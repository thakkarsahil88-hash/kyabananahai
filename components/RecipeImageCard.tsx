'use client'
import { Recipe } from '@/lib/types'

interface Props {
  recipe: Recipe
  servings: number
  imageUrl?: string | null
}

export function RecipeImageCard({ recipe, servings, imageUrl }: Props) {
  return (
    <div
      id="recipe-card"
      style={{ fontFamily: 'Georgia, serif', width: '640px', backgroundColor: '#fffaf5' }}
    >
      {/* Hero image */}
      {imageUrl && (
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={recipe.dish_name}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)'
          }} />
          {/* Brand watermark on image */}
          <div style={{
            position: 'absolute', top: '14px', right: '16px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            borderRadius: '20px',
            padding: '4px 10px',
            color: 'white',
            fontSize: '10px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}>
            क्या बनाना है?
          </div>
          {/* Title on image */}
          <div style={{ position: 'absolute', bottom: '18px', left: '24px', right: '24px' }}>
            <h1 style={{
              color: 'white', fontSize: '26px', fontWeight: 700,
              lineHeight: 1.2, margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>{recipe.dish_name}</h1>
          </div>
        </div>
      )}

      {/* Header block (shown when no image, or always for description + stats) */}
      {!imageUrl && (
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          padding: '28px 28px 0 28px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>
            क्या बनाना है?
          </p>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {recipe.dish_name}
          </h1>
        </div>
      )}

      {/* Description + stats bar */}
      <div style={{
        background: imageUrl ? 'white' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        padding: imageUrl ? '16px 24px 0' : '12px 28px 20px',
      }}>
        <p style={{
          color: imageUrl ? '#6b7280' : 'rgba(255,255,255,0.85)',
          fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5,
          fontFamily: 'Inter, sans-serif',
          fontStyle: 'italic',
        }}>
          {recipe.description}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '0',
          backgroundColor: imageUrl ? '#fff7ed' : 'rgba(0,0,0,0.15)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {[
            { icon: '🔥', value: `${recipe.calories_per_person}`, label: 'cal / person' },
            { icon: '⏱', value: `${recipe.cook_time_minutes}`, label: 'minutes' },
            { icon: '👥', value: `${servings}`, label: 'servings' },
            { icon: '📊', value: recipe.difficulty, label: 'difficulty' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, padding: '10px 6px', textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${imageUrl ? '#fed7aa' : 'rgba(255,255,255,0.15)'}` : 'none',
            }}>
              <div style={{ fontSize: '14px' }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 700,
                fontSize: '13px', color: imageUrl ? '#ea580c' : 'white',
                marginTop: '2px',
              }}>{stat.value}</div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: '9px',
                color: imageUrl ? '#9ca3af' : 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition row */}
      {recipe.nutrition_per_person && (
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: '8px' }}>
          {[
            { label: 'Protein', value: `${recipe.nutrition_per_person.protein_g}g`, color: '#3b82f6' },
            { label: 'Carbs', value: `${recipe.nutrition_per_person.carbs_g}g`, color: '#f59e0b' },
            { label: 'Fat', value: `${recipe.nutrition_per_person.fat_g}g`, color: '#ef4444' },
            { label: 'Fibre', value: `${recipe.nutrition_per_person.fiber_g}g`, color: '#10b981' },
          ].map((n, i) => (
            <div key={i} style={{
              flex: 1, backgroundColor: '#f9fafb', borderRadius: '8px',
              padding: '8px 4px', textAlign: 'center',
              borderTop: `3px solid ${n.color}`,
            }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#111827' }}>{n.value}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{n.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#f3e8d8', margin: '12px 24px 0' }} />

      {/* Body: Ingredients + Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '20px 24px 16px' }}>

        {/* Ingredients */}
        <div style={{ paddingRight: '20px', borderRight: '1px solid #f3e8d8' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px',
            color: '#f97316', margin: '0 0 12px',
          }}>Ingredients</h2>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '5px 0', borderBottom: '1px solid #fef3e8',
            }}>
              <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{ing.name}</span>
              <span style={{
                fontSize: '11px', color: '#f97316', fontWeight: 600,
                fontFamily: 'Inter, sans-serif', marginLeft: '8px', whiteSpace: 'nowrap',
              }}>{ing.quantity}</span>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ paddingLeft: '20px' }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px',
            color: '#f97316', margin: '0 0 12px',
          }}>Method</h2>
          {recipe.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: '20px', height: '20px',
                borderRadius: '50%', backgroundColor: '#fff7ed',
                border: '1.5px solid #fed7aa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: 700, color: '#f97316',
              }}>{i + 1}</div>
              <p style={{
                fontSize: '11.5px', color: '#4b5563', lineHeight: 1.5,
                margin: 0, fontFamily: 'Inter, sans-serif',
              }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #f3e8d8',
        padding: '10px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#d1d5db', letterSpacing: '1px' }}>
          kyabananahai.vercel.app
        </span>
        <span style={{ fontSize: '16px' }}>🍽️</span>
      </div>
    </div>
  )
}
