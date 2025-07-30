'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, getUsername } from '@/lib/utils'

export function usePageTracking() {
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClient()
  const sessionIdRef = useRef<string | null>(null)
  const enterTimeRef = useRef<Date | null>(null)
  const isTrackingRef = useRef(false)

  useEffect(() => {
    if (!user || isTrackingRef.current) return

    const discordId = getDiscordId(user)
    const username = getUsername(user)
    
    if (!discordId) return

    const startSession = async () => {
      try {
        isTrackingRef.current = true
        enterTimeRef.current = new Date()

        const { data, error } = await supabase
          .from('page_sessions')
          .insert({
            discord_id: discordId,
            username,
            page_path: pathname,
            enter_time: enterTimeRef.current.toISOString(),
            is_active: true,
          })
          .select('id')
          .single()

        if (error) {
          console.error('Error starting page session:', error)
          return
        }

        sessionIdRef.current = data.id
      } catch (error) {
        console.error('Error in startSession:', error)
      }
    }

    const endSession = async () => {
      if (!sessionIdRef.current || !enterTimeRef.current) return

      try {
        const exitTime = new Date()
        const timeSpentSeconds = Math.round(
          (exitTime.getTime() - enterTimeRef.current.getTime()) / 1000
        )

        await supabase
          .from('page_sessions')
          .update({
            exit_time: exitTime.toISOString(),
            time_spent_seconds: timeSpentSeconds,
            is_active: false,
            updated_at: exitTime.toISOString(),
          })
          .eq('id', sessionIdRef.current)

        sessionIdRef.current = null
        enterTimeRef.current = null
        isTrackingRef.current = false
      } catch (error) {
        console.error('Error ending page session:', error)
      }
    }

    // Start tracking
    startSession()

    // End session on cleanup
    return () => {
      endSession()
    }
  }, [pathname, user, supabase])

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!sessionIdRef.current) return

      try {
        await supabase
          .from('page_sessions')
          .update({
            is_active: !document.hidden,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionIdRef.current)
      } catch (error) {
        console.error('Error updating session visibility:', error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [supabase])
}