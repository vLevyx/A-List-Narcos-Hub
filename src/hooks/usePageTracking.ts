'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { getDiscordId, getUsername } from '@/lib/utils'
import type { Database } from '@/types/database'

// Enhanced PageSession interface matching your database schema
interface PageSession {
  id: string
  discord_id: string
  username: string | null
  page_path: string
  enter_time: string | null
  exit_time: string | null
  time_spent_seconds: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export function usePageTracking() {
  const { user } = useAuth()
  const pathname = usePathname()
  const supabase = createClient()
  
  // Enhanced session management refs
  const currentSessionRef = useRef<PageSession | null>(null)
  const enterTimeRef = useRef<Date | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sessionCreationLockRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const isTrackingRef = useRef<boolean>(false)

  // SECURITY ENHANCEMENT: Secure session cleanup
  const endCurrentSession = useCallback(async (skipCleanup = false) => {
    if (!currentSessionRef.current || !enterTimeRef.current) return

    try {
      const exitTime = new Date()
      const timeSpentSeconds = Math.round(
        (exitTime.getTime() - enterTimeRef.current.getTime()) / 1000
      )
      
      // With RLS policies, users can only update their own sessions
      // Admins can update any session
      await supabase
        .from('page_sessions')
        .update({
          exit_time: exitTime.toISOString(),
          time_spent_seconds: timeSpentSeconds,
          is_active: false,
          updated_at: exitTime.toISOString()
        })
        .eq('id', currentSessionRef.current.id)

      if (!skipCleanup) {
        currentSessionRef.current = null
        enterTimeRef.current = null
        isTrackingRef.current = false
      }
    } catch (error) {
      console.error('Error ending page session:', error)
    }
  }, [supabase])

  // SECURITY ENHANCEMENT: Improved session creation with orphan cleanup
  const startNewSession = useCallback(async (pagePath: string, discordId: string, username: string) => {
    // Prevent multiple simultaneous session creations
    if (sessionCreationLockRef.current || isTrackingRef.current) return
    sessionCreationLockRef.current = true

    try {
      // End any existing session first
      if (currentSessionRef.current) {
        await endCurrentSession(true)
      }

      // Clean up any orphaned active sessions for this user/page combination
      // RLS policy ensures users can only update their own sessions
      try {
        await supabase
          .from('page_sessions')
          .update({
            exit_time: new Date().toISOString(),
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('discord_id', discordId) // RLS will automatically filter to user's own data
          .eq('page_path', pagePath)
          .eq('is_active', true)
      } catch (cleanupError) {
        console.warn('Error cleaning up orphaned sessions:', cleanupError)
        // Continue with session creation even if cleanup fails
      }

      // Create new session - RLS ensures discord_id matches current user
      isTrackingRef.current = true
      enterTimeRef.current = new Date()
      
      const { data, error } = await supabase
        .from('page_sessions')
        .insert({
          discord_id: discordId, // Must match current user's discord_id due to RLS
          username,
          page_path: pagePath,
          enter_time: enterTimeRef.current.toISOString(),
          is_active: true
        })
        .select('id, discord_id, username, page_path, enter_time, exit_time, time_spent_seconds, is_active, created_at, updated_at')
        .single()

      if (error) {
        console.error('Error starting page session:', error)
        isTrackingRef.current = false
        enterTimeRef.current = null
        return
      }

      if (data && isMountedRef.current) {
        currentSessionRef.current = data
        startHeartbeat()
      }
    } catch (error) {
      console.error('Error in startNewSession:', error)
      isTrackingRef.current = false
      enterTimeRef.current = null
    } finally {
      sessionCreationLockRef.current = false
    }
  }, [supabase, endCurrentSession])

  // SECURITY ENHANCEMENT: Enhanced activity tracking
  const updateSessionActivity = useCallback(async (isActive: boolean) => {
    if (!currentSessionRef.current) return

    try {
      // RLS policy ensures users can only update their own sessions
      await supabase
        .from('page_sessions')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSessionRef.current.id)
    } catch (error) {
      console.error('Error updating session activity:', error)
    }
  }, [supabase])

  // SECURITY ENHANCEMENT: Heartbeat system for session validation
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    // Send heartbeat every 5 minutes when page is visible
    heartbeatIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && currentSessionRef.current && isMountedRef.current) {
        updateSessionActivity(true)
      }
    }, 5 * 60 * 1000) // 5 minutes
  }, [updateSessionActivity])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // SECURITY ENHANCEMENT: Enhanced visibility tracking
  const handleVisibilityChange = useCallback(() => {
    if (!currentSessionRef.current || !isMountedRef.current) return

    if (document.visibilityState === 'hidden') {
      updateSessionActivity(false)
      stopHeartbeat()
      
      // Set a timeout to end the session if the page stays hidden for more than 8 minutes
      visibilityTimeoutRef.current = setTimeout(() => {
        if (currentSessionRef.current && document.visibilityState === 'hidden' && isMountedRef.current) {
          endCurrentSession()
        }
      }, 8 * 60 * 1000) // 8 minutes
    } else if (document.visibilityState === 'visible') {
      updateSessionActivity(true)
      startHeartbeat()
      
      // Cancel the timeout since the page is visible again
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
        visibilityTimeoutRef.current = null
      }
    }
  }, [updateSessionActivity, startHeartbeat, stopHeartbeat, endCurrentSession])

  // SECURITY ENHANCEMENT: Enhanced unload handling with keepalive
  const handlePageUnload = useCallback(() => {
    if (!currentSessionRef.current || !enterTimeRef.current) return

    const exitTime = new Date()
    const timeSpentSeconds = Math.round(
      (exitTime.getTime() - enterTimeRef.current.getTime()) / 1000
    )
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && apiKey && 'fetch' in window) {
      const url = `${supabaseUrl}/rest/v1/page_sessions?id=eq.${currentSessionRef.current.id}`
      
      const updatePayload = JSON.stringify({
        exit_time: exitTime.toISOString(),
        time_spent_seconds: timeSpentSeconds,
        is_active: false,
        updated_at: exitTime.toISOString()
      })
      
      try {
        // Use fetch with keepalive for better browser support
        fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: updatePayload,
          keepalive: true // This ensures the request continues even if page unloads
        }).catch(error => {
          console.error('Error sending keepalive request:', error)
        })
      } catch (error) {
        console.error('Error sending unload request:', error)
        // Fallback to sendBeacon if fetch fails
        if (navigator.sendBeacon) {
          try {
            const beaconData = new Blob([updatePayload], { type: 'application/json' })
            const beaconUrl = `${url}&apikey=${encodeURIComponent(apiKey)}`
            navigator.sendBeacon(beaconUrl, beaconData)
          } catch (beaconError) {
            console.error('Error with sendBeacon fallback:', beaconError)
          }
        }
      }
    }
    
    // Always attempt regular API call as final fallback
    endCurrentSession()
  }, [endCurrentSession])

  // SECURITY ENHANCEMENT: Main session management effect
  useEffect(() => {
    // Reset mounted state
    isMountedRef.current = true

    if (!user) {
      // Clean up any existing session when user logs out
      if (currentSessionRef.current) {
        endCurrentSession()
      }
      return
    }

    const discordId = getDiscordId(user)
    const username = getUsername(user)
    
    if (!discordId) {
      console.warn('No Discord ID found for user, skipping page tracking')
      return
    }

    // Start new session for the current page
    startNewSession(pathname, discordId, username)

    // Cleanup function
    return () => {
      isMountedRef.current = false
      endCurrentSession()
    }
  }, [user, pathname, startNewSession, endCurrentSession])

  // SECURITY ENHANCEMENT: Event listeners setup
  useEffect(() => {
    if (!user || !currentSessionRef.current) return

    // Set up event listeners for page visibility and unload
    const handleVisibilityChangeWrapper = () => {
      if (isMountedRef.current) {
        handleVisibilityChange()
      }
    }

    const handlePageUnloadWrapper = () => {
      if (isMountedRef.current) {
        handlePageUnload()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChangeWrapper, { passive: true })
    window.addEventListener('beforeunload', handlePageUnloadWrapper, { passive: true })
    window.addEventListener('pagehide', handlePageUnloadWrapper, { passive: true })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChangeWrapper)
      window.removeEventListener('beforeunload', handlePageUnloadWrapper)
      window.removeEventListener('pagehide', handlePageUnloadWrapper)
      
      stopHeartbeat()
      
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
        visibilityTimeoutRef.current = null
      }
    }
  }, [user, handleVisibilityChange, handlePageUnload, stopHeartbeat])

  // SECURITY ENHANCEMENT: Cleanup effect on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      
      // Clean up all timers and intervals
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
        visibilityTimeoutRef.current = null
      }
      
      // End current session
      if (currentSessionRef.current) {
        endCurrentSession()
      }
    }
  }, [endCurrentSession])
}