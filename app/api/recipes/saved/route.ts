import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = supabaseAdmin()
  const { data: user } = await admin.from('users').select('id').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data } = await admin
    .from('recipes')
    .select('*, recipe_sessions(key_ingredient, servings, created_at)')
    .eq('user_id', user.id)
    .eq('saved', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ recipes: data ?? [] })
}
