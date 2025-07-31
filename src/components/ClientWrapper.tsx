'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

/**
 * ClientWrapper handles client-side initialization and side effects
 * This component is loaded at the bottom of pages to avoid blocking SSR
 */
export default function ClientWrapper() {
  const { user } = useAuth()

  useEffect(() => {
    // Client-side initialization logic can go here
    // For example: analytics, feature flags, etc.
    
    if (typeof window !== 'undefined') {
      // Ensure smooth scrolling is available
      document.documentElement.style.scrollBehavior = 'smooth'
      
      // Log client-side hydration for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Client hydrated successfully')
      }
    }
  }, [])

  useEffect(() => {
    // Handle user-specific client-side logic
    if (user) {
      // Could track user interactions, set up real-time listeners, etc.
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 User authenticated:', user.user_metadata?.username)
      }
    }
  }, [user])

  // This component doesn't render anything visible
  return null
}