// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Add debugging logs
  console.log('Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  })

  // Add path traversal protection from working project
  if (!next.startsWith('/')) {
    next = '/'
  }

  // Handle OAuth errors with detailed logging
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = createClient()
   
    try {
      console.log('Attempting to exchange code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
     
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        throw exchangeError
      }

      if (data.session) {
        console.log('Session created successfully, verifying user...')
        
        // Verify the session is valid - additional security check
        const { data: user, error: userError } = await supabase.auth.getUser()
       
        if (userError || !user.user) {
          console.error('Invalid session after exchange:', userError)
          throw new Error('Invalid session after exchange')
        }

        console.log('User verified:', user.user.email)

        // Build redirect URL with environment awareness
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
       
        let redirectUrl: string
        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }

        // Add success indicator for frontend handling
        const url = new URL(redirectUrl)
        url.searchParams.set('auth', 'success')
       
        console.log('Successful auth callback, redirecting to:', url.toString())
        return NextResponse.redirect(url.toString())
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      // Add more specific error handling based on your working project
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=session_exchange_failed`)
    }
  }

  // Redirect to error page - fallback for any unhandled cases
  console.warn('Auth callback failed - no code or session exchange failed')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}