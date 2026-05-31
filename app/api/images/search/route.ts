import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ url: null })

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return NextResponse.json({ url: null })

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' food dish')}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    )
    const data = await res.json()
    const photo = data.photos?.[0]
    if (!photo) return NextResponse.json({ url: null })
    return NextResponse.json({ url: photo.src.large })
  } catch {
    return NextResponse.json({ url: null })
  }
}
