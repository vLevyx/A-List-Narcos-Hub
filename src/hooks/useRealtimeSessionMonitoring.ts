// src/hooks/useRealtimeSessionMonitoring.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { getDiscordId } from '@/lib/utils'

// Admin Discord IDs for client-side admin checking
const ADMIN_DISCORD_IDS = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []

interface ActiveSession {
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

export function useRealtimeSessionMonitoring() {
  const { user } = useAuth()
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Check if current user is admin
  const isCurrentUserAdmin = useCallback(() => {
    const discordId = getDiscordId(user)
    return discordId && ADMIN_DISCORD_IDS.includes(discordId)
  }, [user])

  const fetchActiveSessions = useCallback(async () => {
    if (!user || !isCurrentUserAdmin()) {
      setActiveSessions([])
      setOnlineUsers(new Set())
      setLoading(false)
      setError('Admin access required')
      return
    }

    try {
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Get all sessions (not just active ones) to determine online status
      const { data: sessions, error: fetchError } = await supabase
        .from('page_sessions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      // Filter truly active sessions (updated within last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
      const activeSessions = sessions?.filter(session => 
        session.is_active && new Date(session.updated_at) > twoMinutesAgo
      ) || []

      setActiveSessions(activeSessions)
      
      // Determine online users - more aggressive detection
      // Consider users online if they have ANY session updated within last 3 minutes
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
      const onlineUserIds = new Set<string>()
      
      sessions?.forEach(session => {
        // Check if session is recent and active OR was recently active
        const sessionTime = new Date(session.updated_at)
        const isRecentlyActive = sessionTime > threeMinutesAgo
        
        if (session.is_active && isRecentlyActive) {
          onlineUserIds.add(session.discord_id)
        }
      })
      
      console.log('Online users detected:', onlineUserIds.size, Array.from(onlineUserIds))
      setOnlineUsers(onlineUserIds)
      setError(null)
    } catch (err) {
      console.error('Error fetching active sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch active sessions')
    } finally {
      setLoading(false)
    }
  }, [user, isCurrentUserAdmin, supabase])

  useEffect(() => {
    if (!user || !isCurrentUserAdmin()) {
      setActiveSessions([])
      setOnlineUsers(new Set())
      setLoading(false)
      setError('Admin access required')
      return
    }

    // Initial fetch
    fetchActiveSessions()

    // Set up real-time subscription for page_sessions
    const sessionsChannel = supabase
      .channel('page-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_sessions'
        },
        (payload) => {
          console.log('Page session changed:', payload)
          fetchActiveSessions()
        }
      )
      .subscribe()

    // More frequent refresh for better real-time updates (every 15 seconds)
    const interval = setInterval(() => {
      console.log('Refreshing sessions...')
      fetchActiveSessions()
    }, 15000)

    return () => {
      supabase.removeChannel(sessionsChannel)
      clearInterval(interval)
    }
  }, [user, isCurrentUserAdmin, fetchActiveSessions, supabase])

  return { 
    activeSessions, 
    onlineUsers,
    loading, 
    error,
    isAdmin: isCurrentUserAdmin(),
    refreshSessions: fetchActiveSessions
  }
}