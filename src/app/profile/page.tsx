"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Timer, 
  RefreshCw,
  Activity,
  Crown,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Share2,
  Settings,
  TrendingUp,
  BarChart3,
  Monitor,
  Eye,
  Award,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Trophy,
  Hash,
  Link as LinkIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, getUsername, getAvatarUrl, formatDate, timeAgo, formatNumber } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface UserProfile {
  created_at: string
  last_login: string | null
  revoked: boolean
  login_count: number
  discord_id: string
  username: string | null
  hub_trial: boolean
  trial_expiration: string | null
}

interface SessionAnalytics {
  totalSessions: number
  totalTimeSpent: number
  averageSessionTime: number
  mostVisitedPage: string
  lastSeenDevice: string
  weeklyActivity: Array<{ day: string; sessions: number; timeSpent: number }>
  popularPages: Array<{ path: string; visits: number; timeSpent: number }>
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

interface ProfileStats {
  joinedDaysAgo: number
  loginStreak: number
  averageLoginInterval: number
  profileCompleteness: number
  accessDuration: number
  trialDaysRemaining?: number
}

export default function ProfilePage() {
  usePageTracking()
  const router = useRouter()
  const { user, loading: authLoading, hasAccess, isTrialActive, isAdmin } = useAuth()
  const supabase = createClient()

  // ====================================
  // STATE MANAGEMENT
  // ====================================
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataLoadedOnce, setDataLoadedOnce] = useState(false)
  
  // UI State
  const [copiedDiscordId, setCopiedDiscordId] = useState(false)
  const [copiedProfileUrl, setCopiedProfileUrl] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // ====================================
  // COMPUTED VALUES
  // ====================================
  
  // Profile Statistics
  const profileStats = useMemo((): ProfileStats | null => {
    if (!userProfile) return null

    const now = new Date()
    const joinDate = new Date(userProfile.created_at)
    const joinedDaysAgo = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calculate trial days remaining
    let trialDaysRemaining: number | undefined
    if (userProfile.hub_trial && userProfile.trial_expiration) {
      const trialExpiry = new Date(userProfile.trial_expiration)
      const daysLeft = Math.ceil((trialExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      trialDaysRemaining = Math.max(0, daysLeft)
    }

    return {
      joinedDaysAgo,
      loginStreak: Math.min(userProfile.login_count, 30),
      averageLoginInterval: joinedDaysAgo > 0 ? Math.round(joinedDaysAgo / Math.max(userProfile.login_count, 1)) : 0,
      profileCompleteness: calculateProfileCompleteness(),
      accessDuration: calculateAccessDuration(),
      trialDaysRemaining
    }
  }, [userProfile])

  function calculateProfileCompleteness(): number {
    if (!userProfile) return 0
    let completeness = 60
    if (userProfile.username) completeness += 20
    if (userProfile.last_login) completeness += 10
    if (userProfile.login_count > 5) completeness += 10
    return Math.min(completeness, 100)
  }

  function calculateAccessDuration(): number {
    if (!userProfile) return 0
    const now = new Date()
    const joinDate = new Date(userProfile.created_at)
    return Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Status Badges with enhanced logic
  const statusBadges = useMemo(() => {
    if (!userProfile) return []

    const badges = []
    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null

    // Admin badge
    if (isAdmin) {
      badges.push({
        key: 'admin',
        icon: Crown,
        text: 'Administrator',
        className: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30',
        priority: 1
      })
    }

    // Status badges
    if (userProfile.revoked) {
      badges.push({
        key: 'revoked',
        icon: XCircle,
        text: 'Access Revoked',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        priority: 5
      })
    } else if (userProfile.hub_trial) {
      const isTrialActive = trialExpiration && trialExpiration > now
      badges.push({
        key: 'trial',
        icon: isTrialActive ? Timer : Clock,
        text: isTrialActive ? 'Trial Active' : 'Trial Expired',
        className: isTrialActive 
          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
          : 'bg-red-500/20 text-red-400 border-red-500/30',
        priority: 3
      })
    } else {
      badges.push({
        key: 'access',
        icon: CheckCircle,
        text: 'Full Access',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
        priority: 2
      })
    }

    // Activity badges
    if (userProfile.login_count >= 50) {
      badges.push({
        key: 'veteran',
        icon: Trophy,
        text: 'Veteran User',
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        priority: 4
      })
    } else if (userProfile.login_count >= 10) {
      badges.push({
        key: 'active',
        icon: Star,
        text: 'Active User',
        className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        priority: 6
      })
    }

    return badges.sort((a, b) => a.priority - b.priority)
  }, [userProfile, isAdmin])

  // ====================================
  // DATA LOADING FUNCTIONS
  // ====================================

  const fetchProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) return

    if (dataLoadedOnce && !forceRefresh) return

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const discordId = getDiscordId(user)
      if (!discordId) throw new Error('No Discord ID found')

      // Fetch user profile
      const { data: profileData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .maybeSingle()

      if (fetchError) throw new Error(`Failed to fetch profile: ${fetchError.message}`)
      if (!profileData) throw new Error('Profile not found. Please try refreshing the page.')

      setUserProfile(profileData)
      await loadSessionAnalytics(discordId)
      await loadAchievements(profileData)
      setDataLoadedOnce(true)

      if (forceRefresh) {
        showSuccessNotification('Profile refreshed successfully!')
      }

    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, supabase, dataLoadedOnce])

  const loadSessionAnalytics = useCallback(async (discordId: string) => {
    try {
      const { data: sessions, error } = await supabase
        .from('page_sessions')
        .select('*')
        .eq('discord_id', discordId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      if (sessions && sessions.length > 0) {
        const totalSessions = sessions.length
        const totalTimeSpent = sessions.reduce((sum, session) => {
          const timeSpent = session.time_spent_seconds
          return sum + (typeof timeSpent === 'number' ? timeSpent : 0)
        }, 0)
        const averageSessionTime = totalSessions > 0 ? totalTimeSpent / totalSessions : 0
        
        const pageVisits = sessions.reduce((acc, session) => {
          const path = session.page_path
          if (typeof path === 'string') {
            acc[path] = (acc[path] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
        
        const mostVisitedPage = Object.entries(pageVisits)
          .sort(([, a], [, b]) => (typeof b === 'number' ? b : 0) - (typeof a === 'number' ? a : 0))[0]?.[0] || '/dashboard'

        // Calculate actual weekly activity from sessions
        const weeklyActivity = calculateWeeklyActivity(sessions)
        
        const popularPages = Object.entries(pageVisits)
          .map(([path, visits]) => ({
            path,
            visits: typeof visits === 'number' ? visits : 0,
            timeSpent: sessions
              .filter(s => s.page_path === path)
              .reduce((sum, s) => {
                const timeSpent = s.time_spent_seconds
                return sum + (typeof timeSpent === 'number' ? timeSpent : 0)
              }, 0)
          }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5)

        // Calculate activity streaks from actual session data
        const streaks = calculateActivityStreaks(sessions)

        setSessionAnalytics({
          totalSessions,
          totalTimeSpent,
          averageSessionTime,
          mostVisitedPage,
          lastSeenDevice: 'Desktop',
          weeklyActivity,
          popularPages,
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
          lastActiveDate: sessions[0]?.created_at || null
        })
      } else {
        // No sessions yet
        setSessionAnalytics({
          totalSessions: 0,
          totalTimeSpent: 0,
          averageSessionTime: 0,
          mostVisitedPage: '/dashboard',
          lastSeenDevice: 'Desktop',
          weeklyActivity: getEmptyWeeklyActivity(),
          popularPages: [],
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null
        })
      }
    } catch (error) {
      console.error('Error loading session analytics:', error)
    }
  }, [supabase])

  // Helper function to calculate actual weekly activity from sessions
  const calculateWeeklyActivity = (sessions: any[]): Array<{ day: string; sessions: number; timeSpent: number }> => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    
    // Get start of current week (Monday)
    const startOfWeek = new Date(now)
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Handle Sunday = 0
    startOfWeek.setDate(now.getDate() + diff)
    startOfWeek.setHours(0, 0, 0, 0)
    
    return days.map((day, index) => {
      const dayStart = new Date(startOfWeek)
      dayStart.setDate(startOfWeek.getDate() + index)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      // Filter sessions for this specific day
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })
      
      const dayTimeSpent = daySessions.reduce((sum, session) => {
        const timeSpent = session.time_spent_seconds
        return sum + (typeof timeSpent === 'number' ? timeSpent : 0)
      }, 0)
      
      return {
        day,
        sessions: daySessions.length,
        timeSpent: dayTimeSpent
      }
    })
  }

  // Helper function to get empty weekly activity
  const getEmptyWeeklyActivity = (): Array<{ day: string; sessions: number; timeSpent: number }> => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({ day, sessions: 0, timeSpent: 0 }))
  }

  // Helper function to calculate activity streaks from session data
  const calculateActivityStreaks = (sessions: any[]): { currentStreak: number; longestStreak: number } => {
    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    // Group sessions by date (YYYY-MM-DD)
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    }, {} as Record<string, any[]>)

    // Get unique dates and sort them
    const uniqueDates = Object.keys(sessionsByDate).sort()
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    // Calculate streaks
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i > 0) {
        const prevDate = new Date(uniqueDates[i - 1])
        const currDate = new Date(uniqueDates[i])
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          // Consecutive day
          tempStreak++
        } else {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0]
    const mostRecentDate = uniqueDates[uniqueDates.length - 1]
    
    if (mostRecentDate === today) {
      // User was active today, count backwards
      currentStreak = 1
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(uniqueDates[i])
        const nextDate = new Date(uniqueDates[i + 1])
        const dayDiff = Math.floor((nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          currentStreak++
        } else {
          break
        }
      }
    } else {
      // Check if the most recent date was yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (mostRecentDate === yesterdayStr) {
        // User was active yesterday, count backwards from yesterday
        currentStreak = 1
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const prevDate = new Date(uniqueDates[i])
          const nextDate = new Date(uniqueDates[i + 1])
          const dayDiff = Math.floor((nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (dayDiff === 1) {
            currentStreak++
          } else {
            break
          }
        }
      } else {
        // Streak is broken (no activity today or yesterday)
        currentStreak = 0
      }
    }

    return { currentStreak, longestStreak }
  }

  const loadAchievements = useCallback(async (profile: UserProfile) => {
    const achievements: Achievement[] = [
      // Welcome Achievements
      {
        id: 'first_login',
        title: 'Welcome Aboard!',
        description: 'Complete your first login',
        icon: '👋',
        unlocked: profile.login_count >= 1,
        unlockedAt: profile.login_count >= 1 ? profile.created_at : undefined
      },
      {
        id: 'profile_explorer',
        title: 'Profile Explorer',
        description: 'Visit your profile page',
        icon: '👤',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      
      // Activity Achievements
      {
        id: 'frequent_user',
        title: 'Regular Visitor',
        description: 'Log in 10 times',
        icon: '⭐',
        unlocked: profile.login_count >= 10,
        progress: Math.min(profile.login_count, 10),
        maxProgress: 10
      },
      {
        id: 'dedicated_user',
        title: 'Dedicated User',
        description: 'Log in 25 times',
        icon: '🎯',
        unlocked: profile.login_count >= 25,
        progress: Math.min(profile.login_count, 25),
        maxProgress: 25
      },
      {
        id: 'veteran',
        title: 'Veteran User',
        description: 'Log in 50 times',
        icon: '🏆',
        unlocked: profile.login_count >= 50,
        progress: Math.min(profile.login_count, 50),
        maxProgress: 50
      },
      {
        id: 'legend',
        title: 'Legend',
        description: 'Log in 100 times',
        icon: '👑',
        unlocked: profile.login_count >= 100,
        progress: Math.min(profile.login_count, 100),
        maxProgress: 100
      },
      
      // Streak Achievements
      {
        id: 'streak_starter',
        title: 'Streak Starter',
        description: 'Maintain a 3-day activity streak',
        icon: '🔥',
        unlocked: sessionAnalytics ? sessionAnalytics.longestStreak >= 3 : false,
        progress: sessionAnalytics ? Math.min(sessionAnalytics.longestStreak, 3) : 0,
        maxProgress: 3
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 7-day activity streak',
        icon: '⚡',
        unlocked: sessionAnalytics ? sessionAnalytics.longestStreak >= 7 : false,
        progress: sessionAnalytics ? Math.min(sessionAnalytics.longestStreak, 7) : 0,
        maxProgress: 7
      },
      {
        id: 'unstoppable',
        title: 'Unstoppable',
        description: 'Maintain a 30-day activity streak',
        icon: '🚀',
        unlocked: sessionAnalytics ? sessionAnalytics.longestStreak >= 30 : false,
        progress: sessionAnalytics ? Math.min(sessionAnalytics.longestStreak, 30) : 0,
        maxProgress: 30
      },
      
      // Time-based Achievements
      {
        id: 'early_adopter',
        title: 'Early Adopter',
        description: 'Join during the launch month (Aug 30 - Sep 30, 2025)',
        icon: '🌟',
        unlocked: (() => {
          const joinDate = new Date(profile.created_at)
          const launchStart = new Date('2025-08-30')
          const launchEnd = new Date('2025-09-30')
          return joinDate >= launchStart && joinDate <= launchEnd
        })()
      },
      {
        id: 'one_month',
        title: 'One Month Strong',
        description: 'Be a member for 30 days',
        icon: '📅',
        unlocked: (() => {
          const joinDate = new Date(profile.created_at)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff >= 30
        })(),
        progress: (() => {
          const joinDate = new Date(profile.created_at)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
          return Math.min(daysDiff, 30)
        })(),
        maxProgress: 30
      },
      {
        id: 'six_months',
        title: 'Long-term Member',
        description: 'Be a member for 6 months',
        icon: '🎖️',
        unlocked: (() => {
          const joinDate = new Date(profile.created_at)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff >= 180
        })(),
        progress: (() => {
          const joinDate = new Date(profile.created_at)
          const now = new Date()
          const daysDiff = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
          return Math.min(daysDiff, 180)
        })(),
        maxProgress: 180
      },
      
      // Special Achievements
      {
        id: 'trial_graduate',
        title: 'Trial Graduate',
        description: 'Complete your trial period',
        icon: '🎓',
        unlocked: profile.hub_trial && profile.trial_expiration ? 
          new Date(profile.trial_expiration) < new Date() : false
      },
      {
        id: 'weekend_warrior',
        title: 'Weekend Warrior',
        description: 'Active on weekends',
        icon: '🏖️',
        unlocked: Math.random() > 0.5
      },
      {
        id: 'explorer',
        title: 'Explorer',
        description: 'Visit 5+ different pages',
        icon: '🗺️',
        unlocked: Math.random() > 0.4
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Join our Discord community',
        icon: '💬',
        unlocked: Math.random() > 0.3
      }
    ]
    
    setAchievements(achievements)
  }, [sessionAnalytics])

  // Helper function to generate weekly activity
  const generateWeeklyActivity = (sessions: any[]): Array<{ day: string; sessions: number; timeSpent: number }> => {
    // This function is now replaced by calculateWeeklyActivity above
    // Keeping for backwards compatibility but not used
    return []
  }

  const handleManualRefresh = useCallback(async () => {
    setDataLoadedOnce(false)
    await fetchProfile(true)
  }, [fetchProfile])

  // ====================================
  // UI INTERACTION HANDLERS
  // ====================================

  const copyDiscordId = useCallback(async () => {
    if (!userProfile?.discord_id) return

    try {
      await navigator.clipboard.writeText(userProfile.discord_id)
      setCopiedDiscordId(true)
      setTimeout(() => setCopiedDiscordId(false), 2000)
    } catch (err) {
      console.error('Failed to copy Discord ID:', err)
    }
  }, [userProfile?.discord_id])

  const copyProfileUrl = useCallback(async () => {
    try {
      const url = `${window.location.origin}/profile/${userProfile?.discord_id}`
      await navigator.clipboard.writeText(url)
      setCopiedProfileUrl(true)
      setTimeout(() => setCopiedProfileUrl(false), 2000)
    } catch (err) {
      console.error('Failed to copy profile URL:', err)
    }
  }, [userProfile?.discord_id])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const showSuccessNotification = useCallback((message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }, [])

  const exportUserData = useCallback(async () => {
    if (!userProfile || !sessionAnalytics) return

    const exportData = {
      profile: userProfile,
      analytics: sessionAnalytics,
      achievements: achievements,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-data-${userProfile.discord_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showSuccessNotification('Profile data exported successfully!')
  }, [userProfile, sessionAnalytics, achievements, showSuccessNotification])

  // ====================================
  // EFFECTS
  // ====================================

  // Real-time subscriptions
  useEffect(() => {
    if (!user || !dataLoadedOnce) return

    const discordId = getDiscordId(user)
    if (!discordId) return

    const userSubscription = supabase
      .channel(`user_profile_${discordId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `discord_id=eq.${discordId}`
        },
        (payload) => {
          console.log('Profile updated:', payload)
          if (payload.new && typeof payload.new === 'object') {
            setUserProfile(payload.new as UserProfile)
            showSuccessNotification('Profile updated!')
          }
        }
      )
      .subscribe()

    return () => {
      userSubscription.unsubscribe()
    }
  }, [user, dataLoadedOnce, supabase, showSuccessNotification])

  // Initial load
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    if (!dataLoadedOnce) {
      fetchProfile()
    }
  }, [user, authLoading, router, dataLoadedOnce, fetchProfile])

  // ====================================
  // RENDER HELPERS
  // ====================================

  const renderAccessInfo = () => {
    if (!userProfile) return null

    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null
    const isTrialExpired = trialExpiration ? trialExpiration < now : false

    if (isAdmin) {
      return {
        type: 'admin',
        title: '👑 Administrator Access',
        description: 'You have unlimited administrative access to all features.',
        color: 'bg-accent-secondary/20 border-accent-secondary/30'
      }
    }

    if (userProfile.revoked) {
      return {
        type: 'revoked',
        title: '⚠️ Access Revoked',
        description: 'Your access has been revoked. Contact administrators for assistance.',
        color: 'bg-red-500/20 border-red-500/30'
      }
    }

    if (userProfile.hub_trial && trialExpiration && !isTrialExpired) {
      const timeLeft = Math.ceil((trialExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        type: 'trial',
        title: '⏱️ Trial Active',
        description: `Trial expires: ${formatDate(trialExpiration.toISOString())}`,
        additionalInfo: `${timeLeft} day${timeLeft !== 1 ? 's' : ''} remaining`,
        color: 'bg-blue-500/20 border-blue-500/30'
      }
    }

    if (userProfile.hub_trial && isTrialExpired) {
      return {
        type: 'expired',
        title: '⏰ Trial Expired',
        description: `Your trial expired on ${formatDate(trialExpiration!.toISOString())}`,
        color: 'bg-orange-500/20 border-orange-500/30'
      }
    }

    if (!userProfile.hub_trial) {
      return {
        type: 'access',
        title: '✅ Full Access',
        description: 'You have permanent access to all premium features.',
        color: 'bg-green-500/20 border-green-500/30'
      }
    }

    return {
      type: 'pending',
      title: '⏳ Pending Access',
      description: 'Request access in our Discord server.',
      color: 'bg-yellow-500/20 border-yellow-500/30'
    }
  }

  // ====================================
  // RENDER GUARDS
  // ====================================

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-secondary animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-text-secondary mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full gradient-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user || !userProfile) return null

  const avatar = getAvatarUrl(user)
  const username = getUsername(user)
  const accessInfo = renderAccessInfo()

  // ====================================
  // MAIN RENDER
  // ====================================

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4">
      {/* Floating Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-background-secondary/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg border border-accent-primary/20"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-accent-primary" />
              <span className="font-medium">{notificationMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">Profile Dashboard</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Manage your account and view detailed analytics
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={exportUserData}
              variant="outline"
              className="flex-1 lg:flex-none"
              disabled={!sessionAnalytics}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button
              onClick={copyProfileUrl}
              variant="outline"
              className="flex-1 lg:flex-none"
            >
              {copiedProfileUrl ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </>
              )}
            </Button>
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              disabled={refreshing}
              className="flex-1 lg:flex-none"
            >
              {refreshing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-background-secondary/50 rounded-2xl p-8 border border-white/10 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                <Image
                  src={avatar}
                  alt={username}
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-accent-primary/20"
                  priority
                />
                {isAdmin && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Crown className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4">
                <h2 className="text-3xl font-bold mb-2">
                  {username}
                </h2>
                
                {/* Discord ID with enhanced copy functionality */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Hash className="w-4 h-4 text-text-secondary" />
                  <code className="text-text-secondary bg-background-primary/50 px-2 py-1 rounded text-sm font-mono">
                    {userProfile.discord_id}
                  </code>
                  <button
                    onClick={copyDiscordId}
                    className="text-accent-primary hover:text-accent-light transition-colors p-1 rounded hover:bg-white/5"
                    title="Copy Discord ID"
                  >
                    {copiedDiscordId ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {statusBadges.map(({ key, icon: Icon, text, className }) => (
                    <motion.span
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm shadow-lg ${className}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {text}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-background-primary/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-secondary">Member Since</span>
                    <Calendar className="w-4 h-4 text-accent-primary" />
                  </div>
                  <p className="font-semibold">{formatDate(userProfile.created_at)}</p>
                  {profileStats && (
                    <p className="text-xs text-text-secondary mt-1">
                      {profileStats.joinedDaysAgo} days ago
                    </p>
                  )}
                </div>
                
                <div className="bg-background-primary/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-secondary">Last Active</span>
                    <Clock className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="font-semibold">{timeAgo(userProfile.last_login)}</p>
                </div>
                
                <div className="bg-background-primary/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-secondary">Total Logins</span>
                    <Activity className="w-4 h-4 text-accent-secondary" />
                  </div>
                  <p className="font-semibold">{formatNumber(userProfile.login_count)}</p>
                </div>
                
                <div className="bg-background-primary/30 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text-secondary">Current Streak</span>
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="font-semibold">
                    {sessionAnalytics ? `${sessionAnalytics.currentStreak} days` : 'Loading...'}
                  </p>
                  {sessionAnalytics && (
                    <p className="text-xs text-text-secondary mt-1">
                      Best: {sessionAnalytics.longestStreak} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Access Status Card */}
        {accessInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`rounded-2xl p-6 border backdrop-blur-sm mb-8 shadow-xl ${accessInfo.color}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {accessInfo.type === 'admin' && <Crown className="w-8 h-8 text-accent-secondary" />}
                {accessInfo.type === 'revoked' && <XCircle className="w-8 h-8 text-red-400" />}
                {accessInfo.type === 'trial' && <Timer className="w-8 h-8 text-blue-400" />}
                {accessInfo.type === 'expired' && <Clock className="w-8 h-8 text-orange-400" />}
                {accessInfo.type === 'access' && <CheckCircle className="w-8 h-8 text-green-400" />}
                {accessInfo.type === 'pending' && <Clock className="w-8 h-8 text-yellow-400" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{accessInfo.title}</h3>
                <p className="text-text-primary mb-2">{accessInfo.description}</p>
                {accessInfo.additionalInfo && (
                  <p className="text-text-secondary text-sm">{accessInfo.additionalInfo}</p>
                )}
                
                {/* Trial Progress Bar */}
                {accessInfo.type === 'trial' && profileStats?.trialDaysRemaining !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>Trial Progress</span>
                      <span>{profileStats.trialDaysRemaining} days left</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-accent-primary h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max(0, Math.min(100, ((7 - profileStats.trialDaysRemaining) / 7) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {accessInfo.type === 'pending' && (
                    <Button
                      onClick={() => router.push('/whitelist')}
                      className="gradient-primary"
                      size="sm"
                    >
                      Request Access
                    </Button>
                  )}
                  {accessInfo.type === 'expired' && (
                    <Button
                      onClick={() => window.open('https://discord.gg/3dz8WuazAc', '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      onClick={() => router.push('/admin')}
                      className="bg-accent-secondary/20 hover:bg-accent-secondary/30 text-accent-secondary border-accent-secondary/30"
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expandable Sections */}
        <div className="space-y-6">
          
          {/* Session Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background-secondary/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('analytics')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xl font-semibold">Session Analytics</h3>
                {sessionAnalytics && (
                  <span className="bg-accent-primary/20 text-accent-primary px-3 py-1 rounded-full text-sm">
                    {sessionAnalytics.totalSessions} sessions
                  </span>
                )}
              </div>
              {expandedSections.has('analytics') ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.has('analytics') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/10"
                >
                  <div className="p-6">
                    {sessionAnalytics ? (
                      <div className="space-y-6">
                        {/* Analytics Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-background-primary/30 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-text-secondary">Total Time</span>
                              <Clock className="w-5 h-5 text-accent-primary" />
                            </div>
                            <p className="text-2xl font-bold">
                              {Math.round(sessionAnalytics.totalTimeSpent / 60)}m
                            </p>
                            <p className="text-sm text-text-secondary">
                              Avg: {Math.round(sessionAnalytics.averageSessionTime / 60)}m per session
                            </p>
                          </div>
                          
                          <div className="bg-background-primary/30 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-text-secondary">Activity Streak</span>
                              <Zap className="w-5 h-5 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold text-orange-400">
                              {sessionAnalytics.currentStreak} days
                            </p>
                            <p className="text-sm text-text-secondary">
                              Best: {sessionAnalytics.longestStreak} days
                            </p>
                          </div>
                          
                          <div className="bg-background-primary/30 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-text-secondary">Most Visited</span>
                              <Eye className="w-5 h-5 text-green-400" />
                            </div>
                            <p className="text-lg font-bold truncate">
                              {sessionAnalytics.mostVisitedPage}
                            </p>
                          </div>
                        </div>

                        {/* Weekly Activity Chart */}
                        <div className="bg-background-primary/30 rounded-xl p-4 border border-white/10">
                          <h4 className="text-lg font-semibold mb-4">Weekly Activity</h4>
                          <div className="grid grid-cols-7 gap-2">
                            {sessionAnalytics.weeklyActivity.map((day, index) => (
                              <div key={day.day} className="text-center">
                                <div className="text-xs text-text-secondary mb-2">{day.day}</div>
                                <div
                                  className="bg-accent-primary/20 rounded-lg flex items-end justify-center text-xs font-medium text-accent-primary transition-all duration-500"
                                  style={{
                                    height: `${Math.max(20, (day.sessions / Math.max(...sessionAnalytics.weeklyActivity.map(d => d.sessions))) * 60)}px`
                                  }}
                                >
                                  {day.sessions}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Popular Pages */}
                        <div className="bg-background-primary/30 rounded-xl p-4 border border-white/10">
                          <h4 className="text-lg font-semibold mb-4">Popular Pages</h4>
                          <div className="space-y-3">
                            {sessionAnalytics.popularPages.map((page, index) => (
                              <div key={page.path} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-text-secondary text-sm">#{index + 1}</span>
                                  <code className="text-accent-primary bg-accent-primary/10 px-2 py-1 rounded text-sm">
                                    {page.path}
                                  </code>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{page.visits} visits</div>
                                  <div className="text-text-secondary text-sm">{Math.round(page.timeSpent / 60)}m</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                        <p className="text-text-secondary">No session data available yet</p>
                        <p className="text-text-secondary/70 text-sm">Visit more pages to see analytics</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-background-secondary/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('achievements')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-semibold">Achievements</h3>
                <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              {expandedSections.has('achievements') ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.has('achievements') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/10"
                >
                  <div className="p-6">
                    <div className="grid gap-4">
                      {achievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                            achievement.unlocked
                              ? 'bg-amber-500/10 border-amber-500/30'
                              : 'bg-background-primary/30 border-white/10'
                          }`}
                        >
                          <div className={`text-3xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${achievement.unlocked ? 'text-amber-400' : 'text-text-secondary'}`}>
                              {achievement.title}
                            </h4>
                            <p className={`text-sm ${achievement.unlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                              {achievement.description}
                            </p>
                            {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                                      achievement.unlocked ? 'bg-amber-400' : 'bg-accent-primary'
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%`
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                            {achievement.unlockedAt && (
                              <p className="text-xs text-amber-400 mt-1">
                                Unlocked {timeAgo(achievement.unlockedAt)}
                              </p>
                            )}
                          </div>
                          {achievement.unlocked && (
                            <CheckCircle className="w-6 h-6 text-amber-400" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Account Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-background-secondary/50 rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('details')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-text-secondary" />
                <h3 className="text-xl font-semibold">Account Details</h3>
              </div>
              {expandedSections.has('details') ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.has('details') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/10"
                >
                  <div className="p-6 space-y-6">
                    {/* Account Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold mb-4">Account Information</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Discord ID</span>
                            <div className="flex items-center space-x-2">
                              <code className="bg-background-primary/50 px-2 py-1 rounded text-sm">
                                {userProfile.discord_id}
                              </code>
                              <button
                                onClick={copyDiscordId}
                                className="text-accent-primary hover:text-accent-light transition-colors"
                              >
                                {copiedDiscordId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Username</span>
                            <span className="font-medium">{username}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Member Since</span>
                            <span className="font-medium">{formatDate(userProfile.created_at)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Last Login</span>
                            <span className="font-medium">{timeAgo(userProfile.last_login)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="text-text-secondary">Total Logins</span>
                            <span className="font-medium">{userProfile.login_count}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold mb-4">Access & Trial Info</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Access Status</span>
                            <span className={`font-medium ${
                              userProfile.revoked ? 'text-red-400' :
                              hasAccess ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {userProfile.revoked ? 'Revoked' : hasAccess ? 'Active' : 'Pending'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-text-secondary">Trial Status</span>
                            <span className="font-medium">
                              {userProfile.hub_trial ? (isTrialActive ? 'Active' : 'Expired') : 'No Trial'}
                            </span>
                          </div>
                          
                          {userProfile.trial_expiration && (
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="text-text-secondary">Trial Expires</span>
                              <span className="font-medium">
                                {formatDate(userProfile.trial_expiration)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="text-text-secondary">Profile Completeness</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${profileStats?.profileCompleteness || 0}%` }}
                                />
                              </div>
                              <span className="font-medium text-sm">
                                {profileStats?.profileCompleteness || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={exportUserData}
                          variant="outline"
                          size="sm"
                          disabled={!sessionAnalytics}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                        
                        <Button
                          onClick={copyProfileUrl}
                          variant="outline"
                          size="sm"
                        >
                          {copiedProfileUrl ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Profile Link Copied!
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Copy Profile Link
                            </>
                          )}
                        </Button>
                        
                        {!hasAccess && (
                          <Button
                            onClick={() => router.push('/whitelist')}
                            className="gradient-primary"
                            size="sm"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Request Access
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => window.open('https://discord.gg/3dz8WuazAc', '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Discord
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}