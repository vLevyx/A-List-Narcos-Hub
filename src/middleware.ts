import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs'

// Enhanced security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const

// Route configuration
const routeConfig = {
  // Routes that require authentication
  authRequired: ['/profile', '/whitelist'],
  
  // Routes that require admin privileges
  adminRequired: ['/admin'],
  
  // Public routes that should still have security headers
  publicSecure: ['/api', '/auth'],
  
  // Routes that need no-cache headers
  noCache: ['/profile', '/admin', '/whitelist', '/api'],
  
  // Routes that can be cached longer
  cacheable: ['/', '/terms', '/privacy'],
} as const

// Set security headers
function setSecurityHeaders(response: NextResponse, pathname: string) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Enhanced security for admin routes
  if (routeConfig.adminRequired.some(route => pathname.startsWith(route))) {
    response.headers.set('X-Admin-Route', 'true')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

// Set cache headers
function setCacheHeaders(response: NextResponse, pathname: string) {
  if (routeConfig.noCache.some(route => pathname.startsWith(route))) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else if (routeConfig.cacheable.some(route => pathname === route)) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }
}

// Clear authentication cookies
function clearAuthCookies(response: NextResponse) {
  const authCookies = [
    'sb-access-token',
    'sb-refresh-token', 
    'supabase-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
    'auth_cache',
    'profile_data_cache',
    'blueprints_cache',
    'session',
    'auth-session',
    'user-session',
    'login-state',
  ]
  
  authCookies.forEach(cookieName => {
    response.cookies.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  })
}

// Rate limiting headers
function setRateLimitHeaders(response: NextResponse, pathname: string) {
  if (routeConfig.adminRequired.some(route => pathname.startsWith(route))) {
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Window', '3600')
  } else if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '1000')
    response.headers.set('X-RateLimit-Window', '3600')
  }
}

// Security event logging
function logSecurityEvent(request: NextRequest, event: string, details?: string) {
  const timestamp = new Date().toISOString()
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  console.log(`[SECURITY] ${timestamp} | ${event} | IP: ${ip} | Path: ${request.nextUrl.pathname} | Details: ${details || 'none'} | UA: ${userAgent.slice(0, 100)}`)
}

// Direct session update to avoid Edge Runtime issues
async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('Session refresh error:', error.message)
      // Don't throw - just log and continue
    }

    return response
  } catch (error: any) {
    console.warn('Supabase middleware error:', error.message)
    return response
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  try {
    // Log admin route access
    if (routeConfig.adminRequired.some(route => pathname.startsWith(route))) {
      logSecurityEvent(request, 'ADMIN_ROUTE_ACCESS')
    }

    // Core session update with error handling
    const response = await updateSession(request)
    
    // Apply security headers
    setSecurityHeaders(response, pathname)
    setCacheHeaders(response, pathname)
    setRateLimitHeaders(response, pathname)

    return response
    
  } catch (error: any) {
    const errorType = error?.name || 'UnknownError'
    const errorMessage = error?.message || 'Unknown error'
    
    logSecurityEvent(request, 'MIDDLEWARE_ERROR', `${errorType}: ${errorMessage}`)
    console.warn('Middleware auth error:', errorMessage)
    
    // Handle refresh token errors
    if (error?.message?.includes('refresh') || 
        error?.message?.includes('Refresh Token Not Found') ||
        error?.name === 'AuthApiError') {
      
      logSecurityEvent(request, 'AUTH_TOKEN_CLEARED', 'Refresh token error')
      
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      
      clearAuthCookies(response)
      setSecurityHeaders(response, pathname)
      setCacheHeaders(response, pathname)
      
      return response
    }
    
    // For other errors, continue with security headers
    console.error('Unexpected middleware error:', error)
    
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    setSecurityHeaders(response, pathname)
    setCacheHeaders(response, pathname)
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     * - file extensions (images, css, js, fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}