'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, getUsername, isUserAdmin, getFromStorage, setToStorage, removeFromStorage } from '@/lib/utils'
import { withTimeout } from '@/lib/timeout'
import type { User, Session } from '@supabase/supabase-js'

// Add the UserWithAccess type definition here
interface UserWithAccess {
  id: string
  discord_id: string
  username: string | null
  created_at: string
  revoked: boolean
  last_login: string | null
  login_count: number
  hub_trial: boolean
  trial_expiration: string | null
  hasAccess: boolean
  isTrialActive: boolean
}

interface ExtendedAuthState {
  user: User | null
  session: Session | null
  loading: boolean
  hasAccess: boolean
  isTrialActive: boolean
  isAdmin: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
}

interface AuthContextType extends ExtendedAuthState {
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
  error: Error | null
  isRefreshing: boolean
  lastUpdated: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CACHE_KEY = 'auth_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes
const HEALTH_CHECK_INTERVAL = 60 * 1000 // 1 minute
const MAX_RETRY_ATTEMPTS = 3

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const [state, setState] = useState<ExtendedAuthState>({
    user: null,
    session: null,
    loading: true,
    hasAccess: false,
    isTrialActive: false,
    isAdmin: false,
    canViewAnalytics: false,
    canManageUsers: false,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [hasValidCache, setHasValidCache] = useState(false)

  const retryAttemptsRef = useRef(0)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  // Cache management
  const invalidateCache = useCallback(() => {
    removeFromStorage(CACHE_KEY)
    setHasValidCache(false)
  }, [])

  // Server-side admin checking via RLS
  const checkAdminStatusSecure = useCallback(async (user?: User): Promise<boolean> => {
    if (!user && !state.user) return false
    const currentUser = user || state.user
    if (!currentUser) return false
    
    try {
      const { data, error } = await supabase.rpc('is_admin')
      
      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }
      
      return data === true
    } catch (error) {
      console.error('Failed to check admin status:', error)
      return false
    }
  }, [state.user, supabase])

  // Client-side fallback (UI only)
  const checkAdminStatusFallback = useCallback((user?: User): boolean => {
    const currentUser = user || state.user
    if (!currentUser) return false
    return isUserAdmin(currentUser)
  }, [state.user])

  // Combined admin checking with server-first approach
  const checkAdminStatus = useCallback(async (user?: User): Promise<boolean> => {
    try {
      // Try server-side check first
      const serverResult = await withTimeout(checkAdminStatusSecure(user), 3000)
      return serverResult
    } catch (error) {
      console.warn('Server admin check failed, using fallback:', error)
      // Fall back to client-side check for UI purposes only
      return checkAdminStatusFallback(user)
    }
  }, [checkAdminStatusSecure, checkAdminStatusFallback])

  // Check user access and trial status
  const checkUserAccess = useCallback(async (user: User): Promise<{
    hasAccess: boolean
    isTrialActive: boolean
    userData?: UserWithAccess
  }> => {
    try {
      const discordId = getDiscordId(user)
      if (!discordId) return { hasAccess: false, isTrialActive: false }

      // Fix: Execute the query directly without withTimeout for now
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .single()

      if (error || !userData) {
        return { hasAccess: false, isTrialActive: false }
      }

      // Check if revoked
      if (userData.revoked) {
        return { 
          hasAccess: false, 
          isTrialActive: false, 
          userData: { ...userData, hasAccess: false, isTrialActive: false }
        }
      }

      // Check trial status
      const now = new Date()
      const isTrialActive = userData.hub_trial && 
        userData.trial_expiration && 
        new Date(userData.trial_expiration) > now

      const hasAccess = !userData.revoked && (isTrialActive || await checkAdminStatus(user))

      return { 
        hasAccess, 
        isTrialActive, 
        userData: { ...userData, hasAccess, isTrialActive }
      }
    } catch (error) {
      console.error('Error checking user access:', error)
      return { hasAccess: false, isTrialActive: false }
    }
  }, [supabase, checkAdminStatus])

  // Upsert user login
  const upsertUserLogin = useCallback(async (user: User) => {
    try {
      const discordId = getDiscordId(user)
      const username = getUsername(user)
      
      if (!discordId) return

      // Fix: Execute the RPC directly without withTimeout for now
      await supabase.rpc('upsert_user_login', {
        target_discord_id: discordId,
        user_name: username
      })
    } catch (error) {
      console.error('Error upserting user login:', error)
    }
  }, [supabase])

  // Load cached auth state
  const loadFromCache = useCallback(() => {
    try {
      const cached = getFromStorage(CACHE_KEY)
      if (!cached || !cached.timestamp) return false

      const cacheAge = Date.now() - cached.timestamp
      if (cacheAge > CACHE_TTL) {
        invalidateCache()
        return false
      }

      setState(prev => ({
        ...prev,
        ...cached.state,
        loading: false
      }))
      setLastUpdated(cached.timestamp)
      setHasValidCache(true)
      return true
    } catch (error) {
      console.error('Error loading from cache:', error)
      invalidateCache()
      return false
    }
  }, [invalidateCache])

  // Save to cache
  const saveToCache = useCallback((authState: ExtendedAuthState) => {
    try {
      const cacheData = {
        state: authState,
        timestamp: Date.now()
      }
      setToStorage(CACHE_KEY, cacheData)
      setLastUpdated(cacheData.timestamp)
      setHasValidCache(true)
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }, [])

  // Refresh user data
  const refreshUserDataInternal = useCallback(async () => {
    if (isRefreshing) return

    try {
      setIsRefreshing(true)
      setError(null)

      const { data: { session }, error: sessionError } = await withTimeout(
        supabase.auth.getSession()
      )

      if (sessionError) throw sessionError

      if (!session?.user) {
        setState({
          user: null,
          session: null,
          loading: false,
          hasAccess: false,
          isTrialActive: false,
          isAdmin: false,
          canViewAnalytics: false,
          canManageUsers: false,
        })
        invalidateCache()
        setLastUpdated(null)
        return
      }

      // Upsert user login
      await upsertUserLogin(session.user)

      // Check admin status and user access
      const [isAdmin, accessData] = await Promise.all([
        checkAdminStatus(session.user),
        checkUserAccess(session.user)
      ])

      const newState: ExtendedAuthState = {
        user: session.user,
        session,
        loading: false,
        hasAccess: accessData.hasAccess,
        isTrialActive: accessData.isTrialActive,
        isAdmin,
        canViewAnalytics: isAdmin,
        canManageUsers: isAdmin,
      }

      setState(newState)
      saveToCache(newState)
      retryAttemptsRef.current = 0

    } catch (error) {
      console.error('Error refreshing user data:', error)
      retryAttemptsRef.current++
      
      if (retryAttemptsRef.current >= MAX_RETRY_ATTEMPTS) {
        setState(prev => ({ ...prev, loading: false }))
        invalidateCache()
      }
      
      setError(
        error instanceof Error 
          ? error
          : new Error("Failed to refresh user data")
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, supabase, checkAdminStatus, checkUserAccess, upsertUserLogin, saveToCache, invalidateCache])

  const refreshUserData = async () => {
    await refreshUserDataInternal()
  }

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      setError(null)
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "discord",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'identify',
          },
        })
      )
      if (error) throw error
    } catch (error) {
      console.error("Error signing in with Discord:", error)
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to sign in with Discord")
      )
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await withTimeout(supabase.auth.signOut())
      if (error) throw error

      // Complete security cleanup
      invalidateCache()

      setState({
        user: null,
        session: null,
        loading: false,
        hasAccess: false,
        isTrialActive: false,
        isAdmin: false,
        canViewAnalytics: false,
        canManageUsers: false,
      })

      setLastUpdated(null)

      // Clear intervals
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
        healthCheckIntervalRef.current = null
      }

      // Force page reload for complete cleanup
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to sign out")
      )
    }
  }

  // Health check
  const performHealthCheck = useCallback(async () => {
    if (isRefreshing || !state.user) return

    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        5000
      )

      if (error || !session) {
        console.warn('Health check failed - session invalid')
        await signOut()
      }
    } catch (error) {
      console.warn('Health check failed:', error)
    }
  }, [isRefreshing, state.user, supabase])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      // Try to load from cache first
      const cachedData = loadFromCache()
      
      if (!cachedData) {
        setState(prev => ({ ...prev, loading: true }))
        await refreshUserDataInternal()
      }

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return

          console.log('Auth state changed:', event)

          if (event === 'SIGNED_OUT' || !session) {
            setState({
              user: null,
              session: null,
              loading: false,
              hasAccess: false,
              isTrialActive: false,
              isAdmin: false,
              canViewAnalytics: false,
              canManageUsers: false,
            })
            invalidateCache()
            setLastUpdated(null)
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              // Delay to ensure session is fully established
              setTimeout(() => {
                if (mounted) {
                  refreshUserDataInternal()
                }
              }, 1000)
            }
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, []) // Empty dependency array intentional

  // Set up refresh and health check intervals
  useEffect(() => {
    if (state.user && !isRefreshing) {
      // Set up periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshUserDataInternal()
      }, REFRESH_INTERVAL)

      // Set up health check
      healthCheckIntervalRef.current = setInterval(() => {
        performHealthCheck()
      }, HEALTH_CHECK_INTERVAL)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
        healthCheckIntervalRef.current = null
      }
    }
  }, [state.user, isRefreshing, refreshUserDataInternal, performHealthCheck])

  const contextValue: AuthContextType = {
    ...state,
    signInWithDiscord,
    signOut,
    refreshUserData,
    error,
    isRefreshing,
    lastUpdated,
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