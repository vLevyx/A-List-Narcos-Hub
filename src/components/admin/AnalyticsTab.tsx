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
  RefreshCw,
  Activity,
  Globe,
  HelpCircle,
  Crown
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeSessionMonitoring } from '@/hooks/useRealtimeSessionMonitoring'
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

interface UserOption {
  discord_id: string
  username: string | null
}

interface IndividualUserAnalytics {
  userInfo: {
    discord_id: string
    username: string | null
    created_at: string
    last_login: string | null
    login_count: number
    hub_trial: boolean
    trial_expiration: string | null
    revoked: boolean
    isAdmin: boolean
    hasAccess: boolean
  }
  sessionStats: {
    totalSessions: number
    totalTimeSpent: number
    averageSessionTime: number
    activeSessions: number
    lastActiveSession: string | null
  }
  pageStats: PageAnalytics[]
  recentSessions: PageSession[]
  loginHistory: {
    date: string
    count: number
  }[]
  activityPattern: {
    hour: number
    sessions: number
    totalTime: number
  }[]
  engagementScore: {
    score: number
    rank: number
    percentile: number
    breakdown: {
      timeSpentScore: number
      frequencyScore: number
      recentActivityScore: number
      sessionQualityScore: number
    }
  }
  userRankings: {
    timeSpentRank: number
    sessionCountRank: number
    avgSessionRank: number
    totalUsers: number
  }
  adminActionHistory: {
    id: string
    admin_name: string | null
    action: string | null
    description: string | null
    created_at: string
  }[]
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

  // Real-time session monitoring
  const { 
    onlineUsers, 
    activeSessions, 
    loading: sessionLoading,
    refreshSessions
  } = useRealtimeSessionMonitoring()

  // State management
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([])
  const [activeUsers, setActiveUsers] = useState<UserAnalytics[]>([])
  const [timeUnit, setTimeUnit] = useState<"m" | "h" | "d">("m")
  
  // Individual user analytics
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [userOptions, setUserOptions] = useState<UserOption[]>([])
  const [individualUserAnalytics, setIndividualUserAnalytics] = useState<IndividualUserAnalytics | null>(null)

  // Tooltip state
  const [showEngagementTooltip, setShowEngagementTooltip] = useState(false)
  
  // Loading states
  const [loadingState, setLoadingState] = useState({
    analytics: false,
    pageAnalytics: false,
    userAnalytics: false,
    userOptions: false,
    individualUserAnalytics: false
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

  // Load user analytics (active users in last 24 hours) with online status
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
      }>()

      sessions?.forEach(session => {
        const existing = userMap.get(session.discord_id) || {
          username: session.username,
          totalSessions: 0,
          totalTime: 0,
          lastActivity: session.created_at
        }

        userMap.set(session.discord_id, {
          username: session.username || existing.username,
          totalSessions: existing.totalSessions + 1,
          totalTime: existing.totalTime + (session.time_spent_seconds || 0),
          lastActivity: session.created_at > existing.lastActivity ? session.created_at : existing.lastActivity
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
    } catch (error) {
      console.error('Error loading user analytics:', error)
    } finally {
      setLoadingState(prev => ({ ...prev, userAnalytics: false }))
    }
  }, [supabase, user, isAdmin])

  // Load user options for dropdown
  const loadUserOptions = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setLoadingState(prev => ({ ...prev, userOptions: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Get all users with basic info
      const { data, error } = await supabase
        .from('users')
        .select('discord_id, username')
        .order('username', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('User options query error:', error)
        throw error
      }

      setUserOptions(data || [])
    } catch (error) {
      console.error('Error loading user options:', error)
      setStatusMessage({
        type: 'error',
        message: 'Failed to load user options'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, userOptions: false }))
    }
  }, [supabase, user, isAdmin])

  // Load individual user analytics
  const loadIndividualUserAnalytics = useCallback(async (discordId: string) => {
    if (!user || !isAdmin || !discordId) return

    try {
      setLoadingState(prev => ({ ...prev, individualUserAnalytics: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      // Get user info
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .single()

      if (userError) {
        console.error('User info query error:', userError)
        throw userError
      }

      // Calculate user access status
      const now = new Date()
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []
      const isTrialActive = userInfo.hub_trial && 
        userInfo.trial_expiration && 
        new Date(userInfo.trial_expiration) > now
      const isUserAdmin = adminIds.includes(userInfo.discord_id)
      const hasAccess = !userInfo.revoked || isTrialActive || isUserAdmin

      // Get user sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('discord_id', discordId)
        .order('created_at', { ascending: false })

      if (sessionsError) {
        console.error('Sessions query error:', sessionsError)
        throw sessionsError
      }

      // Get ALL users' session data for ranking comparison
      const { data: allUsersSessions, error: allSessionsError } = await supabase
        .from('page_sessions')
        .select('discord_id, time_spent_seconds, created_at')
        .not('time_spent_seconds', 'is', null)
        .gte('time_spent_seconds', 1)

      if (allSessionsError) {
        console.error('All sessions query error:', allSessionsError)
        throw allSessionsError
      }

      // Get admin action history for this user
      const { data: adminActions, error: adminActionsError } = await supabase
        .from('admin_logs')
        .select('id, admin_name, action, description, created_at')
        .eq('target_discord_id', discordId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (adminActionsError) {
        console.error('Admin actions query error:', adminActionsError)
        console.warn('Continuing without admin action history')
      }

      // Calculate current user's session stats
      const validSessions = (sessions || []).filter(s => s.time_spent_seconds && s.time_spent_seconds > 0)
      const totalSessions = validSessions.length
      const totalTimeSpent = validSessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0)
      const averageSessionTime = totalSessions > 0 ? totalTimeSpent / totalSessions : 0
      const activeSessions = (sessions || []).filter(s => s.is_active).length
      const lastActiveSession = sessions && sessions.length > 0 ? sessions[0].created_at : null

      // Calculate aggregate stats for all users for ranking
      const userStatsMap = new Map<string, { totalTime: number; totalSessions: number; avgSession: number }>()
      
      ;(allUsersSessions || []).forEach(session => {
        const existing = userStatsMap.get(session.discord_id) || { totalTime: 0, totalSessions: 0, avgSession: 0 }
        const newTotalTime = existing.totalTime + (session.time_spent_seconds || 0)
        const newTotalSessions = existing.totalSessions + 1
        userStatsMap.set(session.discord_id, {
          totalTime: newTotalTime,
          totalSessions: newTotalSessions,
          avgSession: newTotalTime / newTotalSessions
        })
      })

      // Convert to arrays and sort for ranking
      const usersByTime = Array.from(userStatsMap.entries()).sort((a, b) => b[1].totalTime - a[1].totalTime)
      const usersBySessions = Array.from(userStatsMap.entries()).sort((a, b) => b[1].totalSessions - a[1].totalSessions)
      const usersByAvgSession = Array.from(userStatsMap.entries()).sort((a, b) => b[1].avgSession - a[1].avgSession)

      // Find current user's rankings
      const timeSpentRank = usersByTime.findIndex(([id]) => id === discordId) + 1
      const sessionCountRank = usersBySessions.findIndex(([id]) => id === discordId) + 1
      const avgSessionRank = usersByAvgSession.findIndex(([id]) => id === discordId) + 1
      const totalUsers = userStatsMap.size

      // Calculate Engagement Score
      const maxTotalTime = Math.max(...Array.from(userStatsMap.values()).map(u => u.totalTime))
      const maxSessions = Math.max(...Array.from(userStatsMap.values()).map(u => u.totalSessions))
      const maxAvgSession = Math.max(...Array.from(userStatsMap.values()).map(u => u.avgSession))

      // Recent activity (last 7 days) - Calculate for all users for comparison
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      // Calculate recent activity for all users
      const userRecentActivityMap = new Map<string, number>()
      ;(allUsersSessions || []).forEach(session => {
        if (new Date(session.created_at) >= sevenDaysAgo) {
          const existing = userRecentActivityMap.get(session.discord_id) || 0
          userRecentActivityMap.set(session.discord_id, existing + (session.time_spent_seconds || 0))
        }
      })

      // Get current user's recent activity and max across all users
      const recentTimeSpent = userRecentActivityMap.get(discordId) || 0
      const maxRecentTime = Math.max(...Array.from(userRecentActivityMap.values()), 1) // Ensure at least 1 to avoid division by zero

      // Session Quality (sessions > 2 minutes)
      const qualitySessions = validSessions.filter(s => (s.time_spent_seconds || 0) > 120).length
      const sessionQualityRate = totalSessions > 0 ? qualitySessions / totalSessions : 0

      // Calculate weighted engagement score components (0-100 scale)
      const timeSpentScore = maxTotalTime > 0 ? (totalTimeSpent / maxTotalTime) * 100 : 0
      const frequencyScore = maxSessions > 0 ? (totalSessions / maxSessions) * 100 : 0
      const recentActivityScore = maxRecentTime > 0 ? (recentTimeSpent / maxRecentTime) * 100 : 0
      const sessionQualityScore = sessionQualityRate * 100

      // Weighted engagement score (adjust weights as needed)
      const engagementScore = Math.round(
        (timeSpentScore * 0.3) +      // 30% weight on total time
        (frequencyScore * 0.25) +     // 25% weight on frequency  
        (recentActivityScore * 0.25) + // 25% weight on recent activity
        (sessionQualityScore * 0.2)   // 20% weight on session quality
      )

      // Calculate percentile
      const allEngagementScores = Array.from(userStatsMap.entries()).map(([userId, stats]) => {
        const userRecentTime = userRecentActivityMap.get(userId) || 0
        const userQualitySessions = (allUsersSessions || []).filter(s => 
          s.discord_id === userId && (s.time_spent_seconds || 0) > 120
        ).length
        const userQualityRate = stats.totalSessions > 0 ? userQualitySessions / stats.totalSessions : 0

        const userTimeScore = maxTotalTime > 0 ? (stats.totalTime / maxTotalTime) * 100 : 0
        const userFreqScore = maxSessions > 0 ? (stats.totalSessions / maxSessions) * 100 : 0
        const userRecentScore = maxRecentTime > 0 ? (userRecentTime / maxRecentTime) * 100 : 0
        const userQualityScore = userQualityRate * 100

        return Math.round(
          (userTimeScore * 0.3) + (userFreqScore * 0.25) + (userRecentScore * 0.25) + (userQualityScore * 0.2)
        )
      }).sort((a, b) => b - a)

      const rank = allEngagementScores.findIndex(score => score <= engagementScore) + 1
      const percentile = Math.round(((totalUsers - rank + 1) / totalUsers) * 100)

      // Calculate page stats (unchanged)
      const pageMap = new Map<string, { totalTime: number; sessions: number }>()
      validSessions.forEach(session => {
        const existing = pageMap.get(session.page_path) || { totalTime: 0, sessions: 0 }
        pageMap.set(session.page_path, {
          totalTime: existing.totalTime + (session.time_spent_seconds || 0),
          sessions: existing.sessions + 1
        })
      })

      const pageStats: PageAnalytics[] = Array.from(pageMap.entries())
        .map(([page_path, stats]) => ({
          page_path,
          total_time: stats.totalTime,
          sessions: stats.sessions
        }))
        .sort((a, b) => b.total_time - a.total_time)

      // Get recent sessions (last 20)
      const recentSessionsList = (sessions || []).slice(0, 20)

      // Calculate login history (last 30 days) - unchanged
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentSessions30Days = (sessions || []).filter(s => 
        new Date(s.created_at) >= thirtyDaysAgo
      )

      const loginMap = new Map<string, number>()
      recentSessions30Days.forEach(session => {
        const date = new Date(session.created_at).toDateString()
        loginMap.set(date, (loginMap.get(date) || 0) + 1)
      })

      const loginHistory = Array.from(loginMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14)

      // Calculate activity pattern by hour - unchanged
      const hourlyMap = new Map<number, { sessions: number; totalTime: number }>()
      validSessions.forEach(session => {
        const hour = new Date(session.created_at).getHours()
        const existing = hourlyMap.get(hour) || { sessions: 0, totalTime: 0 }
        hourlyMap.set(hour, {
          sessions: existing.sessions + 1,
          totalTime: existing.totalTime + (session.time_spent_seconds || 0)
        })
      })

      const activityPattern = Array.from({ length: 24 }, (_, hour) => {
        const data = hourlyMap.get(hour) || { sessions: 0, totalTime: 0 }
        return { hour, sessions: data.sessions, totalTime: data.totalTime }
      })

      const analyticsData: IndividualUserAnalytics = {
        userInfo: {
          ...userInfo,
          isAdmin: isUserAdmin,
          hasAccess
        },
        sessionStats: {
          totalSessions,
          totalTimeSpent,
          averageSessionTime,
          activeSessions,
          lastActiveSession
        },
        pageStats,
        recentSessions: recentSessionsList,
        loginHistory,
        activityPattern,
        engagementScore: {
          score: engagementScore,
          rank,
          percentile,
          breakdown: {
            timeSpentScore: Math.round(timeSpentScore),
            frequencyScore: Math.round(frequencyScore),
            recentActivityScore: Math.round(recentActivityScore),
            sessionQualityScore: Math.round(sessionQualityScore)
          }
        },
        userRankings: {
          timeSpentRank: timeSpentRank > 0 ? timeSpentRank : totalUsers,
          sessionCountRank: sessionCountRank > 0 ? sessionCountRank : totalUsers,
          avgSessionRank: avgSessionRank > 0 ? avgSessionRank : totalUsers,
          totalUsers
        },
        adminActionHistory: adminActions || []
      }

      setIndividualUserAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading individual user analytics:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load user analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, individualUserAnalytics: false }))
    }
  }, [supabase, user, isAdmin])

  // Load all analytics data
  const loadAllAnalytics = useCallback(() => {
    loadAnalytics()
    loadPageAnalytics()
    loadUserAnalytics()
    loadUserOptions()
    refreshSessions() // Also refresh session data
  }, [loadAnalytics, loadPageAnalytics, loadUserAnalytics, loadUserOptions, refreshSessions])

  // ====================================
  // EFFECTS
  // ====================================

  // Initial load
  useEffect(() => {
    if (user && isAdmin) {
      loadAllAnalytics()
    }
  }, [user, isAdmin, loadAllAnalytics])

  // Auto-refresh user analytics every 30 seconds for live data
  useEffect(() => {
    if (!user || !isAdmin) return

    const interval = setInterval(() => {
      loadUserAnalytics() // Refresh user analytics for live status
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <p className="text-white/60 text-sm font-medium">Online Now</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {formatNumber(onlineUsers.size)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium">Active Sessions</p>
                <p className="text-3xl font-bold text-[#00c6ff] mt-1">
                  {formatNumber(activeSessions.length)}
                </p>
              </div>
              <Globe className="w-8 h-8 text-[#00c6ff]" />
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

          {/* Active Users with Online Status (Last 24 Hours) */}
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-purple-500/10 border-b border-purple-500/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-purple-400">
                  Active Users (Last 24 Hours)
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                  <div className="w-2 h-2 bg-gray-500 rounded-full ml-3"></div>
                  <span>Offline</span>
                </div>
              </div>
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
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span className={`text-sm font-medium ${
                              onlineUsers.has(user.discord_id) ? "text-green-400" : "text-white/80"
                            }`}>
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

        {/* Live Sessions Monitor */}
        {activeSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 bg-[#1a1a1a] rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Live Sessions</h3>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                {activeSessions.length} Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.slice(0, 6).map((session) => (
                <div key={session.id} className="bg-[#2a2a2a]/50 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium text-sm">
                        {session.username || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-green-400 text-xs font-medium">LIVE</span>
                  </div>
                  <p className="text-white/60 text-xs mb-1">
                    Page: {session.page_path}
                  </p>
                  <p className="text-white/60 text-xs">
                    Started: {timeAgo(session.enter_time || session.created_at)}
                  </p>
                </div>
              ))}
            </div>
            
            {activeSessions.length > 6 && (
              <p className="text-center text-white/60 text-sm mt-4">
                ... and {activeSessions.length - 6} more active sessions
              </p>
            )}
          </motion.div>
        )}

        {/* Recent Activity Section */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
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
                  <div key={session.id} className="flex items-center justify-between py-3 px-4 bg-[#2a2a2a]/50 rounded-lg hover:bg-[#2a2a2a]/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            onlineUsers.has(session.discord_id)
                              ? "bg-green-500 animate-pulse"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <Eye className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {session.username || 'Unknown User'}
                        </p>
                        <p className="text-white/60 text-xs">
                          Visited {session.page_path}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">
                        {timeAgo(session.created_at)}
                      </p>
                      {session.is_active && (
                        <p className="text-green-400 text-xs font-medium">
                          Active
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Individual User Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-8 bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
        >
          <div className="bg-orange-500/10 border-b border-orange-500/20 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-orange-400 mb-2">
                  Individual User Analytics
                </h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                  Select a user to view their detailed analytics and activity patterns
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    const userId = e.target.value
                    setSelectedUserId(userId)
                    if (userId) {
                      loadIndividualUserAnalytics(userId)
                    } else {
                      setIndividualUserAnalytics(null)
                    }
                  }}
                  disabled={loadingState.userOptions}
                  className="w-full sm:min-w-[250px] px-3 sm:px-4 py-2.5 bg-[#2a2a2a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400 text-sm"
                >
                  <option value="">Select a user...</option>
                  {userOptions.map((user) => (
                    <option key={user.discord_id} value={user.discord_id}>
                      {user.username || `User ${user.discord_id}`}
                    </option>
                  ))}
                </select>
                
                {selectedUserId && (
                  <Button
                    onClick={() => loadIndividualUserAnalytics(selectedUserId)}
                    variant="outline"
                    disabled={loadingState.individualUserAnalytics}
                    className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10 hover:shadow-lg hover:shadow-orange-400/20 focus:shadow-lg focus:shadow-orange-400/20"
                  >
                    {loadingState.individualUserAnalytics ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingState.individualUserAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-white/60">Loading user analytics...</p>
              </div>
            ) : !selectedUserId ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">Select a user to view analytics</p>
                <p className="text-white/40 text-sm">
                  Choose a user from the dropdown above to see their detailed activity data
                </p>
              </div>
            ) : individualUserAnalytics ? (
              <div className="space-y-8">
                {/* User Info Header */}
                <div className="p-4 bg-[#2a2a2a]/50 rounded-lg">
                  {/* Mobile Layout */}
                  <div className="flex items-start gap-4 sm:hidden">
                    <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 font-bold text-lg">
                        {(individualUserAnalytics.userInfo.username || individualUserAnalytics.userInfo.discord_id).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2 truncate">
                        {individualUserAnalytics.userInfo.username || 'Unknown User'}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {individualUserAnalytics.userInfo.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          individualUserAnalytics.userInfo.hasAccess
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {individualUserAnalytics.userInfo.hasAccess ? 'Has Access' : 'No Access'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                        <div>
                          <span className="block font-medium mb-1">Discord ID</span>
                          <span className="font-mono text-white/80 text-xs break-all">
                            {individualUserAnalytics.userInfo.discord_id}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium mb-1">Joined</span>
                          <span className="text-white/80">{timeAgo(individualUserAnalytics.userInfo.created_at)}</span>
                        </div>
                        <div>
                          <span className="block font-medium mb-1">Last Login</span>
                          <span className="text-white/80">
                            {individualUserAnalytics.userInfo.last_login ? timeAgo(individualUserAnalytics.userInfo.last_login) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium mb-1">Login Count</span>
                          <span className="text-white/80">{individualUserAnalytics.userInfo.login_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-400 font-bold text-xl">
                        {(individualUserAnalytics.userInfo.username || individualUserAnalytics.userInfo.discord_id).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-semibold text-white">
                          {individualUserAnalytics.userInfo.username || 'Unknown User'}
                        </h4>
                        {individualUserAnalytics.userInfo.isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          individualUserAnalytics.userInfo.hasAccess
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {individualUserAnalytics.userInfo.hasAccess ? 'Has Access' : 'No Access'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-white/60">
                        <div>
                          <span className="block font-medium">Discord ID</span>
                          <span className="font-mono text-white/80">{individualUserAnalytics.userInfo.discord_id}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Joined</span>
                          <span className="text-white/80">{timeAgo(individualUserAnalytics.userInfo.created_at)}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Last Login</span>
                          <span className="text-white/80">
                            {individualUserAnalytics.userInfo.last_login ? timeAgo(individualUserAnalytics.userInfo.last_login) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium">Login Count</span>
                          <span className="text-white/80">{individualUserAnalytics.userInfo.login_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Total Sessions</span>
                      <BarChart3 className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {individualUserAnalytics.sessionStats.totalSessions}
                    </p>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Total Time</span>
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(individualUserAnalytics.sessionStats.totalTimeSpent)}
                    </p>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Avg Session</span>
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(Math.round(individualUserAnalytics.sessionStats.averageSessionTime))}
                    </p>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Active Sessions</span>
                      <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {individualUserAnalytics.sessionStats.activeSessions}
                    </p>
                  </div>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Last Active</span>
                      <Eye className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-lg font-bold text-white">
                      {individualUserAnalytics.sessionStats.lastActiveSession ? timeAgo(individualUserAnalytics.sessionStats.lastActiveSession) : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Engagement Score and Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Engagement Score */}
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <div className="relative">
                      <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-400" />
                        User Engagement Score
                        <button
                          onMouseEnter={() => setShowEngagementTooltip(true)}
                          onMouseLeave={() => setShowEngagementTooltip(false)}
                          onClick={() => setShowEngagementTooltip(!showEngagementTooltip)}
                          className="text-white/40 hover:text-white/70 transition-colors"
                          aria-label="Engagement score information"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </h5>
                      
                      {/* Tooltip */}
                      {showEngagementTooltip && (
                        <div className="absolute top-12 left-0 right-0 z-10 bg-[#1a1a1a] border border-white/20 rounded-lg p-4 shadow-xl">
                          <div className="text-sm text-white/90 space-y-3">
                            <div className="font-semibold text-green-400 mb-2">How Engagement Score is Calculated:</div>
                            
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-blue-400">Total Time Spent (30%)</span>
                                  <div className="text-white/70 text-xs mt-1">
                                    User's total session time compared to the highest time user
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-purple-400">Session Frequency (25%)</span>
                                  <div className="text-white/70 text-xs mt-1">
                                    Number of sessions compared to the most active user
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-yellow-400">Recent Activity (25%)</span>
                                  <div className="text-white/70 text-xs mt-1">
                                    Time spent in last 7 days vs most active recent user
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-green-400">Session Quality (20%)</span>
                                  <div className="text-white/70 text-xs mt-1">
                                    Percentage of sessions longer than 2 minutes
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-white/10 text-xs text-white/60">
                              Score = (Time×0.3) + (Frequency×0.25) + (Recent×0.25) + (Quality×0.2)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-400 mb-2">
                        {individualUserAnalytics.engagementScore.score}/100
                      </div>
                      <div className="text-white/60 text-sm">
                        Rank #{individualUserAnalytics.engagementScore.rank} of {individualUserAnalytics.userRankings.totalUsers} 
                        ({individualUserAnalytics.engagementScore.percentile}th percentile)
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Time Spent</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full transition-all"
                              style={{ width: `${individualUserAnalytics.engagementScore.breakdown.timeSpentScore}%` }}
                            ></div>
                          </div>
                          <span className="text-white/60 text-xs min-w-[2rem]">
                            {individualUserAnalytics.engagementScore.breakdown.timeSpentScore}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Frequency</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-2">
                            <div 
                              className="bg-purple-400 h-2 rounded-full transition-all"
                              style={{ width: `${individualUserAnalytics.engagementScore.breakdown.frequencyScore}%` }}
                            ></div>
                          </div>
                          <span className="text-white/60 text-xs min-w-[2rem]">
                            {individualUserAnalytics.engagementScore.breakdown.frequencyScore}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Recent Activity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full transition-all"
                              style={{ width: `${individualUserAnalytics.engagementScore.breakdown.recentActivityScore}%` }}
                            ></div>
                          </div>
                          <span className="text-white/60 text-xs min-w-[2rem]">
                            {individualUserAnalytics.engagementScore.breakdown.recentActivityScore}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Session Quality</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-2">
                            <div 
                              className="bg-green-400 h-2 rounded-full transition-all"
                              style={{ width: `${individualUserAnalytics.engagementScore.breakdown.sessionQualityScore}%` }}
                            ></div>
                          </div>
                          <span className="text-white/60 text-xs min-w-[2rem]">
                            {individualUserAnalytics.engagementScore.breakdown.sessionQualityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Rankings */}
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      User Rankings
                    </h5>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80">Total Time Spent</span>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-400 font-semibold">
                            #{individualUserAnalytics.userRankings.timeSpentRank}
                          </div>
                          <div className="text-white/60 text-xs">
                            of {individualUserAnalytics.userRankings.totalUsers}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span className="text-white/80">Total Sessions</span>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-400 font-semibold">
                            #{individualUserAnalytics.userRankings.sessionCountRank}
                          </div>
                          <div className="text-white/60 text-xs">
                            of {individualUserAnalytics.userRankings.totalUsers}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-green-400" />
                          <span className="text-white/80">Avg Session Length</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">
                            #{individualUserAnalytics.userRankings.avgSessionRank}
                          </div>
                          <div className="text-white/60 text-xs">
                            of {individualUserAnalytics.userRankings.totalUsers}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Action History */}
                {individualUserAnalytics.adminActionHistory.length > 0 && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      Admin Action History
                    </h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {individualUserAnalytics.adminActionHistory.map((action) => (
                        <div key={action.id} className="flex items-center justify-between py-3 px-4 bg-[#1a1a1a] rounded-lg border border-white/5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                {action.action}
                              </span>
                              <span className="text-white/60 text-sm">
                                by {action.admin_name || 'Unknown Admin'}
                              </span>
                            </div>
                            {action.description && (
                              <p className="text-white/80 text-sm">{action.description}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-white/60">
                            {timeAgo(action.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Pages for This User */}
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-400" />
                      Top Pages by Time Spent
                    </h5>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {individualUserAnalytics.pageStats.length === 0 ? (
                        <p className="text-white/60 text-center py-4">No page data available</p>
                      ) : (
                        individualUserAnalytics.pageStats.slice(0, 10).map((page, index) => (
                          <div key={page.page_path} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <span className="text-orange-400 font-medium text-sm">#{index + 1}</span>
                              <span className="px-2 py-1 bg-[#1a1a1a] rounded text-xs font-mono">
                                {page.page_path}
                              </span>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-white font-medium">{formatTime(page.total_time)}</div>
                              <div className="text-white/60">{page.sessions} sessions</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Sessions */}
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                      Recent Sessions
                    </h5>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {individualUserAnalytics.recentSessions.length === 0 ? (
                        <p className="text-white/60 text-center py-4">No recent sessions</p>
                      ) : (
                        individualUserAnalytics.recentSessions.slice(0, 15).map((session) => (
                          <div key={session.id} className="flex items-center justify-between py-2 border-b border-white/5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-[#1a1a1a] rounded text-xs font-mono">
                                  {session.page_path}
                                </span>
                                {session.is_active && (
                                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-medium">
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-white/60 mt-1">
                                {session.time_spent_seconds ? formatTime(session.time_spent_seconds) : 'Active'}
                              </div>
                            </div>
                            <div className="text-xs text-white/60 text-right">
                              <div>{timeAgo(session.created_at)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Pattern Chart */}
                {individualUserAnalytics.activityPattern.some(p => p.sessions > 0) && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Activity Pattern (24 Hours)
                    </h5>
                    <div className="grid grid-cols-12 gap-1 mb-4">
                      {individualUserAnalytics.activityPattern.map((hour) => (
                        <div key={hour.hour} className="text-center">
                          <div 
                            className="bg-purple-400/20 rounded mb-1 transition-all hover:bg-purple-400/40"
                            style={{ 
                              height: `${Math.max(4, (hour.sessions / Math.max(...individualUserAnalytics.activityPattern.map(h => h.sessions))) * 60)}px`
                            }}
                            title={`${hour.hour}:00 - ${hour.sessions} sessions, ${formatTime(hour.totalTime)}`}
                          ></div>
                          <span className="text-xs text-white/60">{hour.hour}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/60 text-center">
                      Hover over bars to see details • Peak activity: {
                        individualUserAnalytics.activityPattern.reduce((prev, current) => 
                          prev.sessions > current.sessions ? prev : current
                        ).hour
                      }:00
                    </p>
                  </div>
                )}

                {/* Login History */}
                {individualUserAnalytics.loginHistory.length > 0 && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      Recent Login Activity (Last 14 Days)
                    </h5>
                    <div className="space-y-2">
                      {individualUserAnalytics.loginHistory.map((day, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <span className="text-white/80 text-sm">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="bg-green-400/20 rounded h-2"
                              style={{ 
                                width: `${Math.max(20, (day.count / Math.max(...individualUserAnalytics.loginHistory.map(d => d.count))) * 100)}px`
                              }}
                            ></div>
                            <span className="text-green-400 font-medium text-sm min-w-[2rem] text-right">
                              {day.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
                <p className="text-white/60 text-lg mb-2">Failed to load user analytics</p>
                <p className="text-white/40 text-sm">
                  Please try selecting a different user or refresh the data
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}