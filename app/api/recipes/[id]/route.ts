import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = supabaseAdmin()
  const { data: user } = await admin.from('users').select('id').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: recipe } = await admin
    .from('recipes')
    .select('*, recipe_sessions(servings)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    recipe,
    servings: (recipe as any).recipe_sessions?.servings ?? 2,
  })
}
