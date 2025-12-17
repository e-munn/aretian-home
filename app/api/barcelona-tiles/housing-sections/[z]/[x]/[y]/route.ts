import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { z: string; x: string; y: string } }
) {
  try {
    const { z, x, y } = params

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[HousingSectionsAPI] Missing Supabase environment variables')
      return new NextResponse('Server configuration error', { status: 500 })
    }

    const zInt = parseInt(z)
    const xInt = parseInt(x)
    const yInt = parseInt(y)

    if (isNaN(zInt) || isNaN(xInt) || isNaN(yInt)) {
      return new NextResponse('Invalid tile coordinates', { status: 400 })
    }

    if (zInt < 9) {
      return new NextResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.mapbox-vector-tile',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      })
    }

    const maxIndex = Math.pow(2, zInt)
    if (xInt < 0 || xInt >= maxIndex || yInt < 0 || yInt >= maxIndex) {
      return new NextResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.mapbox-vector-tile',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Use boundaries_sections_v3_mvt for housing sections
    let { data, error } = await supabase.rpc('boundaries_sections_v3_mvt', {
      z: zInt,
      x: xInt,
      y: yInt,
    })

    if (error) {
      console.error('[HousingSectionsAPI] Database error:', error)
      return new NextResponse('Database error', { status: 500 })
    }

    const isEmptyMvt = (buf: any) => {
      if (!buf) return true
      if (typeof buf === 'string') return buf.length <= 2
      return (buf as ArrayBuffer).byteLength === 0
    }

    if (isEmptyMvt(data)) {
      const flippedY = (maxIndex - 1) - yInt
      const fb = await supabase.rpc('boundaries_sections_v3_mvt', { z: zInt, x: xInt, y: flippedY })
      if (!fb.error && !isEmptyMvt(fb.data)) {
        data = fb.data as any
      }
    }

    let binaryData: ArrayBuffer
    if (typeof data === 'string') {
      const hexString = data.startsWith('\\x') ? data.slice(2) : data
      const bytes = new Uint8Array(hexString.length / 2)
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
      }
      binaryData = bytes.buffer
    } else {
      binaryData = data
    }

    if (!binaryData || (binaryData as ArrayBuffer).byteLength === 0) {
      return new NextResponse(new ArrayBuffer(0), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.mapbox-vector-tile',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Vary': 'Accept-Encoding',
        },
      })
    }

    return new NextResponse(binaryData, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.mapbox-vector-tile',
        'Cache-Control': process.env.NODE_ENV === 'development'
          ? 'no-cache, no-store, must-revalidate'
          : 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'ETag': `"housing-sections-${z}-${x}-${y}-${process.env.NODE_ENV === 'development' ? Date.now() : 'v2'}"`,
        'Vary': 'Accept-Encoding',
      },
    })
  } catch (error) {
    console.error('[HousingSectionsAPI] Error generating housing sections tile:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
