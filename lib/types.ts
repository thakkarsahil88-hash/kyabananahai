export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  cook_whatsapp?: string
  user_whatsapp?: string
  allergens: string[]
  dietary_prefs: string[]
  disliked_ingredients: string[]
  onboarding_complete: boolean
  created_at: string
}

export interface RecipeSession {
  id: string
  user_id: string
  key_ingredient: string
  other_ingredients: string[]
  avoid_ingredients: string[]
  servings: number
  created_at: string
}

export interface Recipe {
  id: string
  session_id: string
  user_id: string
  dish_name: string
  description: string
  calories_per_person: number
  cook_time_minutes: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ingredients: { name: string; quantity: string }[]
  steps: string[]
  selected: boolean
  created_at: string
}

export interface NeverShowRecipe {
  id: string
  user_id: string
  dish_name: string
  created_at: string
}

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'or', label: 'Odia' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ta', label: 'Tamil' },
  { code: 'mr', label: 'Marathi' },
]

export const ALLERGENS = [
  'Peanuts', 'Tree nuts (cashews, almonds, walnuts)', 'Milk / Dairy', 'Eggs',
  'Wheat / Gluten', 'Soy', 'Fish', 'Shellfish / Prawns', 'Sesame',
  'Mustard', 'Sulphites', 'Celery', 'Lupin', 'Molluscs',
]

export const DIETARY_PREFS = [
  'Vegetarian', 'Vegan', 'Jain (no root vegetables)', 'No Beef',
  'No Pork', 'No Alcohol in cooking', 'Halal', 'Kosher',
  'Low Sodium', 'Low Sugar / Diabetic-friendly', 'Low Fat',
  'High Protein', 'Keto / Low Carb', 'No Onion', 'No Garlic',
]

export const DISLIKED_INGREDIENTS = [
  'Bitter gourd (Karela)', 'Bottle gourd (Lauki)', 'Drumstick (Sahjan)',
  'Taro root (Arbi)', 'Raw banana', 'Jackfruit', 'Lotus stem (Kamal kakdi)',
  'Ivy gourd (Tindora)', 'Pointed gourd (Parwal)', 'Ridge gourd (Turai)',
  'Snake gourd', 'Ash gourd', 'Cauliflower', 'Cabbage', 'Broccoli',
  'Brussels sprouts', 'Mushroom', 'Tofu', 'Paneer', 'Curd / Yogurt',
  'Coconut', 'Tamarind', 'Fenugreek (Methi)', 'Coriander leaves',
  'Mint', 'Curry leaves', 'Asafoetida (Hing)', 'Turmeric',
  'Cumin', 'Cardamom', 'Cloves', 'Star anise', 'Fennel seeds',
  'Black pepper', 'Green chilli', 'Red chilli', 'Ginger', 'Garlic', 'Onion',
]
