// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server' // ✅ gunakan client khusus server

export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('📦 Data diterima:', body)

    const { data, error } = await supabase
      .from('projects')
      .insert([body])
      .select()

    if (error) {
      console.error('🔥 Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (err) {
    console.error('❌ Server error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
