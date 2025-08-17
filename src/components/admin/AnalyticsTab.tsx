"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Eye, 
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, formatNumber } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

// ====================================
// INTERFACES
// ====================================

interface Analytics {
  totalUsers: number
  activeTrials: number
  revokedUsers: number
  usersWithAccess: number
  recentSessions: PageSession[]
}

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

interface PageAnalytics {
  page_path: string
  total_time: number
  sessions: number
}

interface UserAnalytics {
  discord_id: string
  username: string | null
  total_sessions: number
  total_time: number
  last_activity: string
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Format time with specific units
function formatTimeWithUnit(seconds: number, unit: "m" | "h" | "d"): string {
  if (!seconds || seconds <= 0) return '0' + unit
  
  switch (unit) {
    case 'm':
      return Math.round(seconds / 60) + 'm'
    case 'h':
      return (seconds / 3600).toFixed(1) + 'h'
    case 'd':
      return (seconds / 86400).toFixed(2) + 'd'
    default:
      return seconds + 's'
  }
}

// Format time in readable format
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

// ====================================
// MAIN COMPONENT
// ====================================

export function AnalyticsTab() {
  const { user, isAdmin } = useAuth()
  const supabase = createClient()

  // State management
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([])
  const [activeUsers, setActiveUsers] = useState<UserAnalytics[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [timeUnit, setTimeUnit] = useState<"m" | "h" | "d">("m")
  
  // Loading states
  const [loadingState, setLoadingState] = useState({
    analytics: false,
    pageAnalytics: false,
    userAnalytics: false
  })

  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  // ====================================
  // DATA LOADING FUNCTIONS  
  // ====================================

  // Load basic analytics data
  const loadAnalytics = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setLoadingState(prev => ({ ...prev, analytics: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Parallel queries for better performance
      const [
        totalUsersResult,
        activeTrialsResult,
        revokedUsersResult,
        allUsersResult,
        recentSessionsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('hub_trial', true).eq('revoked', false),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('revoked', true),
        supabase.from('users').select('discord_id, hub_trial, trial_expiration')
          .eq('revoked', false),
        supabase.from('page_sessions').select('*')
          .order('created_at', { ascending: false }).limit(10)
      ])

      // Check for errors
      const errors = [
        totalUsersResult.error,
        activeTrialsResult.error,
        revokedUsersResult.error,
        allUsersResult.error,
        recentSessionsResult.error
      ].filter(Boolean)

      if (errors.length > 0) {
        console.error('Analytics query errors:', errors)
        throw new Error('Failed to load analytics data')
      }

      // Calculate users with access
      const now = new Date()
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []
      
      const usersWithAccessCount = (allUsersResult.data || []).filter(user => {
        const isTrialActive = user.hub_trial && 
          user.trial_expiration && 
          new Date(user.trial_expiration) > now
        const isUserAdmin = adminIds.includes(user.discord_id)
        return isTrialActive || isUserAdmin
      }).length

      const analyticsData: Analytics = {
        totalUsers: totalUsersResult.count || 0,
        activeTrials: activeTrialsResult.count || 0,
        revokedUsers: revokedUsersResult.count || 0,
        usersWithAccess: usersWithAccessCount,
        recentSessions: recentSessionsResult.data || []
      }

      setAnalytics(analyticsData)
      setStatusMessage({
        type: 'success',
        message: 'Analytics loaded successfully'
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, analytics: false }))
    }
  }, [supabase, user, isAdmin])

  // Load page analytics
  const loadPageAnalytics = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setLoadingState(prev => ({ ...prev, pageAnalytics: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Query for page analytics - aggregate time spent by page
      const { data, error } = await supabase
        .from('page_sessions')
        .select('page_path, time_spent_seconds')
        .not('time_spent_seconds', 'is', null)
        .gte('time_spent_seconds', 1) // Only include sessions with meaningful time

      if (error) {
        console.error('Page analytics query error:', error)
        throw error
      }

      // Aggregate data by page path
      const pageMap = new Map<string, { totalTime: number; sessions: number }>()
      
      data?.forEach(session => {
        const existing = pageMap.get(session.page_path) || { totalTime: 0, sessions: 0 }
        pageMap.set(session.page_path, {
          totalTime: existing.totalTime + (session.time_spent_seconds || 0),
          sessions: existing.sessions + 1
        })
      })

      // Convert to array and sort by total time
      const pageAnalyticsData: PageAnalytics[] = Array.from(pageMap.entries())
        .map(([page_path, stats]) => ({
          page_path,
          total_time: stats.totalTime,
          sessions: stats.sessions
        }))
        .sort((a, b) => b.total_time - a.total_time)

      setPageAnalytics(pageAnalyticsData)
    } catch (error) {
      console.error('Error loading page analytics:', error)
    } finally {
      setLoadingState(prev => ({ ...prev, pageAnalytics: false }))
    }
  }, [supabase, user, isAdmin])

  // Load user analytics (active users in last 24 hours)
  const loadUserAnalytics = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setLoadingState(prev => ({ ...prev, userAnalytics: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Get sessions from last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: sessions, error } = await supabase
        .from('page_sessions')
        .select('discord_id, username, time_spent_seconds, created_at, updated_at, is_active')
        .gte('created_at', twentyFourHoursAgo)
        .not('time_spent_seconds', 'is', null)

      if (error) {
        console.error('User analytics query error:', error)
        throw error
      }

      // Aggregate user data
      const userMap = new Map<string, {
        username: string | null
        totalSessions: number
        totalTime: number
        lastActivity: string
        isCurrentlyActive: boolean
      }>()

      const currentlyOnline = new Set<string>()

      sessions?.forEach(session => {
        const existing = userMap.get(session.discord_id) || {
          username: session.username,
          totalSessions: 0,
          totalTime: 0,
          lastActivity: session.created_at,
          isCurrentlyActive: false
        }

        // Check if user is currently active (session updated within last 10 minutes)
        const lastUpdate = new Date(session.updated_at)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        if (session.is_active && lastUpdate > tenMinutesAgo) {
          currentlyOnline.add(session.discord_id)
        }

        userMap.set(session.discord_id, {
          username: session.username || existing.username,
          totalSessions: existing.totalSessions + 1,
          totalTime: existing.totalTime + (session.time_spent_seconds || 0),
          lastActivity: session.created_at > existing.lastActivity ? session.created_at : existing.lastActivity,
          isCurrentlyActive: currentlyOnline.has(session.discord_id)
        })
      })

      // Convert to array and sort by total time
      const userAnalyticsData: UserAnalytics[] = Array.from(userMap.entries())
        .map(([discord_id, stats]) => ({
          discord_id,
          username: stats.username,
          total_sessions: stats.totalSessions,
          total_time: stats.totalTime,
          last_activity: stats.lastActivity
        }))
        .sort((a, b) => b.total_time - a.total_time)

      setActiveUsers(userAnalyticsData)
      setOnlineUsers(currentlyOnline)
    } catch (error) {
      console.error('Error loading user analytics:', error)
    } finally {
      setLoadingState(prev => ({ ...prev, userAnalytics: false }))
    }
  }, [supabase, user, isAdmin])

  // Load all analytics data
  const loadAllAnalytics = useCallback(() => {
    loadAnalytics()
    loadPageAnalytics()
    loadUserAnalytics()
  }, [loadAnalytics, loadPageAnalytics, loadUserAnalytics])

  // ====================================
  // EFFECTS
  // ====================================

  // Initial load
  useEffect(() => {
    if (user && isAdmin) {
      loadAllAnalytics()
    }
  }, [user, isAdmin, loadAllAnalytics])

  // Auto-refresh every 30 seconds for live data
  useEffect(() => {
    if (!user || !isAdmin) return

    const interval = setInterval(() => {
      loadUserAnalytics() // Only refresh user analytics for live status
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, isAdmin, loadUserAnalytics])

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage.type) {
      const timer = setTimeout(() => {
        setStatusMessage({ type: null, message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  // ====================================
  // RENDER
  // ====================================

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">Admin access required</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Analytics Overview</h2>
          <p className="text-white/60 mt-1">Real-time insights and user activity tracking</p>
        </div>
        
        <Button
          onClick={loadAllAnalytics}
          variant="outline"
          disabled={Object.values(loadingState).some(Boolean)}
        >
          {Object.values(loadingState).some(Boolean) ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      {/* Status Message */}
      {statusMessage.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-lg ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : statusMessage.type === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}
        >
          <p className="font-medium">{statusMessage.message}</p>
        </motion.div>
      )}

      {/* Stats Cards */}
      {loadingState.analytics ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-white/60">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {formatNumber(analytics.totalUsers)}
                </p>
              </div>
              <Users className="w-8 h-8 text-[#00c6ff]" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">Users with Access</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {formatNumber(analytics.usersWithAccess)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">Active Trials</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">
                  {formatNumber(analytics.activeTrials)}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">Revoked Users</p>
                <p className="text-3xl font-bold text-red-400 mt-1">
                  {formatNumber(analytics.revokedUsers)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/60">Failed to load analytics data</p>
        </div>
      )}

      {/* Analytics Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Top Section: Top Pages and Active Users side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages by Time Spent */}
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-purple-500/10 border-b border-purple-500/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-xl font-semibold text-purple-400">
                  Top Pages by Time Spent
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Time Unit:</span>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as "m" | "h" | "d")}
                    className="px-2 py-1 bg-[#2a2a2a] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    <option value="m">Minutes (m)</option>
                    <option value="h">Hours (h)</option>
                    <option value="d">Days (d)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[#2a2a2a] sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Rank</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Page</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Total Time</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingState.pageAnalytics ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center">
                        <LoadingSpinner size="md" className="mx-auto" />
                        <p className="mt-2 text-white/60">Loading page analytics...</p>
                      </td>
                    </tr>
                  ) : pageAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-white/60">
                        No page analytics data available
                      </td>
                    </tr>
                  ) : (
                    pageAnalytics.slice(0, 15).map((page, index) => (
                      <tr
                        key={page.page_path}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3 font-medium text-white/80 text-sm">
                          #{index + 1}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-[#2a2a2a] rounded text-xs font-mono">
                            {page.page_path}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-white/90 text-sm">
                          {formatTimeWithUnit(page.total_time, timeUnit)}
                        </td>
                        <td className="p-3 text-white/80 text-sm">
                          {page.sessions}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Users (Last 24 Hours) */}
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-purple-500/10 border-b border-purple-500/20 p-4">
              <h3 className="text-xl font-semibold text-purple-400">
                Active Users (Last 24 Hours)
              </h3>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[#2a2a2a] sticky top-0">
                  <tr>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">User</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Status</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Sessions</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Total Time</th>
                    <th className="p-3 text-left text-purple-400 font-medium text-sm">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingState.userAnalytics ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <LoadingSpinner size="md" className="mx-auto" />
                        <p className="mt-2 text-white/60">Loading users...</p>
                      </td>
                    </tr>
                  ) : activeUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/60">
                        No active users in the last 24 hours
                      </td>
                    </tr>
                  ) : (
                    activeUsers.map((user) => (
                      <tr
                        key={user.discord_id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-medium text-white/90 text-sm">
                            {user.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-white/50 font-mono">
                            {user.discord_id}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                onlineUsers.has(user.discord_id)
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span className="text-sm text-white/80">
                              {onlineUsers.has(user.discord_id) ? "Online" : "Offline"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-white/80 text-sm">
                          {user.total_sessions}
                        </td>
                        <td className="p-3 font-medium text-white/90 text-sm">
                          {formatTime(user.total_time)}
                        </td>
                        <td className="p-3 text-white/80 text-sm">
                          {timeAgo(user.last_activity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {analytics.recentSessions.length === 0 ? (
                <p className="text-white/60">No recent activity</p>
              ) : (
                analytics.recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-[#2a2a2a]/50 rounded-lg">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-purple-400 mr-3" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {session.username || 'Unknown User'}
                        </p>
                        <p className="text-white/60 text-xs">
                          Visited {session.page_path}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs">
                      {timeAgo(session.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}