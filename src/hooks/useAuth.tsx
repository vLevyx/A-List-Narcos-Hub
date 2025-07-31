'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, getUsername, isUserAdmin } from '@/lib/utils'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  hasAccess: boolean
  isTrialActive: boolean
  isAdmin: boolean
}

interface AuthContextType extends AuthState {
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    hasAccess: false,
    isTrialActive: false,
    isAdmin: false,
  })

  // Sign in with Discord
  const signInWithDiscord = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) {
        console.error('Error signing in:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }, [supabase.auth])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      setState({
        user: null,
        session: null,
        loading: false,
        hasAccess: false,
        isTrialActive: false,
        isAdmin: false,
      })
      
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }, [supabase.auth, router])

  // Check user access status
  const checkUserAccess = useCallback(async (user: User): Promise<{
    hasAccess: boolean
    isTrialActive: boolean
  }> => {
    const discordId = getDiscordId(user)
    
    if (!discordId) {
      return { hasAccess: false, isTrialActive: false }
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('revoked, hub_trial, trial_expiration')
        .eq('discord_id', discordId)
        .single()

      if (error || !userData) {
        console.error('Error fetching user data:', error)
        return { hasAccess: false, isTrialActive: false }
      }

      const hasAccess = !userData.revoked
      let isTrialActive = false

      if (userData.hub_trial && userData.trial_expiration) {
        const trialExpiration = new Date(userData.trial_expiration)
        const now = new Date()
        isTrialActive = now < trialExpiration && hasAccess
      }

      return { hasAccess, isTrialActive }
    } catch (error) {
      console.error('Error checking user access:', error)
      return { hasAccess: false, isTrialActive: false }
    }
  }, [supabase])

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      if (!session?.user) {
        setState({
          user: null,
          session: null,
          loading: false,
          hasAccess: false,
          isTrialActive: false,
          isAdmin: false,
        })
        return
      }

      const { hasAccess, isTrialActive } = await checkUserAccess(session.user)
      const isAdmin = isUserAdmin(session.user)

      setState({
        user: session.user,
        session,
        loading: false,
        hasAccess,
        isTrialActive,
        isAdmin,
      })
    } catch (error) {
      console.error('Error refreshing user data:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [supabase.auth, checkUserAccess])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Error getting initial session:', error)
          setState(prev => ({ ...prev, loading: false }))
          return
        }

        if (!session?.user) {
          setState(prev => ({ ...prev, loading: false }))
          return
        }

        const { hasAccess, isTrialActive } = await checkUserAccess(session.user)
        const isAdmin = isUserAdmin(session.user)

        if (mounted) {
          setState({
            user: session.user,
            session,
            loading: false,
            hasAccess,
            isTrialActive,
            isAdmin,
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }))
        }
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session) {
          setState({
            user: null,
            session: null,
            loading: false,
            hasAccess: false,
            isTrialActive: false,
            isAdmin: false,
          })
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const { hasAccess, isTrialActive } = await checkUserAccess(session.user)
            const isAdmin = isUserAdmin(session.user)

            if (mounted) {
              setState({
                user: session.user,
                session,
                loading: false,
                hasAccess,
                isTrialActive,
                isAdmin,
              })
            }
          }
        }
      }
    )

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, checkUserAccess])

  const contextValue: AuthContextType = {
    ...state,
    signInWithDiscord,
    signOut,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}