// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Enhanced security headers - CRITICAL for production
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const

// Route configuration - customize based on your needs
const routeConfig = {
  // Routes that require authentication - ADD YOUR PROTECTED ROUTES HERE
  authRequired: ['/profile'], // whitelist is intentionally excluded
  
  // Routes that require admin privileges - ADD YOUR ADMIN ROUTES HERE  
  adminRequired: ['/admin'],
  
  // Public routes that should still have security headers
  publicSecure: ['/api', '/auth', '/whitelist'],
  
  // Routes that need no-cache headers (dynamic content)
  noCache: ['/profile', '/admin', '/api'],
  
  // Routes that can be cached longer (static content)
  cacheable: ['/', '/terms', '/privacy'],
} as const

// Apply security headers to all responses
function setSecurityHeaders(response: NextResponse, pathname: string) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Extra security for admin routes
  if (routeConfig.adminRequired.some(route => pathname.startsWith(route))) {
    response.headers.set('X-Admin-Route', 'true')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

// Smart caching strategy for better performance
function setCacheHeaders(response: NextResponse, pathname: string) {
  if (routeConfig.noCache.some(route => pathname.startsWith(route))) {
    // Dynamic content - always fresh
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  } else if (routeConfig.cacheable.some(route => pathname === route)) {
    // Static content - cache for 1 hour
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }
}

// Check if route requires authentication
function requiresAuth(pathname: string): boolean {
  return routeConfig.authRequired.some(route => pathname.startsWith(route))
}

// Check if route requires admin access
function requiresAdmin(pathname: string): boolean {
  return routeConfig.adminRequired.some(route => pathname.startsWith(route))
}

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
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

  const pathname = request.nextUrl.pathname

  try {
    // Get current session
    const { data: { user }, error } = await supabase.auth.getUser()

    // Route protection logic
    if (requiresAuth(pathname) && !user) {
      // Redirect to home for protected routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (requiresAdmin(pathname)) {
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      // Check admin status using your existing logic
      // You can customize this based on your admin checking method
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []
      const isAdmin = user.user_metadata?.provider_id ? 
        adminIds.includes(user.user_metadata.provider_id) : false

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Apply security and cache headers
    setSecurityHeaders(response, pathname)
    setCacheHeaders(response, pathname)

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Apply headers even on error
    setSecurityHeaders(response, pathname)
    setCacheHeaders(response, pathname)
    
    return response
  }
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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