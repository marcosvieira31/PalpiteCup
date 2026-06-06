import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  // Rate limit nas rotas de API (100 req/min por IP)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const allowed = rateLimit(ip, 100, 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // Rate limit no cron (apenas CRON_SECRET válido)
  if (req.nextUrl.pathname.startsWith('/api/cron/')) {
    const secret = req.headers.get('x-cron-secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options))
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isProtected = ['/dashboard', '/group', '/game', '/profile', '/ranking', '/jogos', '/palpites', '/groups'].some(
    path => req.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback|icons|avatars).*)']
}
