import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {ownerPrincipalAllows} from '@/lib/owner-auth/config'

export async function updateSession(request: NextRequest) {
  // Native bearer endpoints enforce ordinary Auth and membership themselves.
  // Do not redirect them based on unrelated browser cookies.
  if (['/api/owner/session','/api/owner/dashboard'].includes(request.nextUrl.pathname)) {
    return NextResponse.next({request})
  }
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all routes except /login and /auth routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authentication alone does not authorize access to private company data.
  // Owner-provisioned membership is required on every private page.
  if (user && !request.nextUrl.pathname.startsWith('/access-denied')) {
    const { data: membership, error } = await supabase.from('website_approver_principals')
      .select('principal_id,active,supabase_user_id').eq('supabase_user_id', user.id).single()
    if (error || !ownerPrincipalAllows(user.id,membership)) {
      const url = request.nextUrl.clone()
      url.pathname = '/access-denied'
      return NextResponse.redirect(url)
    }
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
