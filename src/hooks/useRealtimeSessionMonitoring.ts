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

      // Get all active sessions
      const { data: sessions, error: fetchError } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      setActiveSessions(sessions || [])
      
      // Determine online users - users with sessions updated within last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const onlineUserIds = new Set<string>()
      
      sessions?.forEach(session => {
        if (session.is_active && new Date(session.updated_at) > fiveMinutesAgo) {
          onlineUserIds.add(session.discord_id)
        }
      })
      
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

    // Set up real-time subscription
    const channel = supabase
      .channel('active-sessions-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_sessions',
          filter: 'is_active=eq.true'
        },
        () => {
          fetchActiveSessions()
        }
      )
      .subscribe()

    // Refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchActiveSessions, 30000)

    return () => {
      supabase.removeChannel(channel)
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