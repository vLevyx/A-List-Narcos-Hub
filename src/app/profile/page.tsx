"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Check
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, getUsername, getAvatarUrl, formatDate, timeAgo } from '@/lib/utils'
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

export default function ProfilePage() {
  usePageTracking()
  const router = useRouter()
  const { user, loading: authLoading, hasAccess, isTrialActive, isAdmin } = useAuth()
  const supabase = createClient()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataLoadedOnce, setDataLoadedOnce] = useState(false)
  const [copiedDiscordId, setCopiedDiscordId] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // ====================================
  // DATA LOADING FUNCTIONS
  // ====================================

  const fetchProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) return

    // Skip if data is already loaded and this isn't a forced refresh
    if (dataLoadedOnce && !forceRefresh) {
      return
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const discordId = getDiscordId(user)
      
      if (!discordId) {
        throw new Error('No Discord ID found')
      }

      // Only fetch user profile data, don't call upsert_user_login
      // The useAuth hook already handles user record creation/verification
      const { data: profileData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .maybeSingle()

      if (fetchError) {
        throw new Error(`Failed to fetch profile: ${fetchError.message}`)
      }

      if (!profileData) {
        // This should rarely happen since useAuth ensures user record exists
        throw new Error('Profile not found. Please try refreshing the page.')
      }

      setUserProfile(profileData)
      setDataLoadedOnce(true)
      console.log('✅ Profile loaded successfully')

    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, supabase, dataLoadedOnce])

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setDataLoadedOnce(false) // Reset cache
    await fetchProfile(true)
  }, [fetchProfile])

  // ====================================
  // REAL-TIME SUBSCRIPTIONS
  // ====================================

  // Set up real-time subscription for user's profile
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
          console.log('User profile changed:', payload)
          // Update local state with the new data
          if (payload.new && typeof payload.new === 'object') {
            setUserProfile(payload.new as UserProfile)
          } else if (payload.eventType === 'DELETE') {
            // Handle user deletion (unlikely but possible)
            setError('Your profile has been removed. Please contact administrators.')
          }
        }
      )
      .subscribe()

    return () => {
      userSubscription.unsubscribe()
    }
  }, [user, dataLoadedOnce, supabase])

  // ====================================
  // INITIAL LOAD EFFECT
  // ====================================

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
  // UTILITY FUNCTIONS
  // ====================================

  // Copy Discord ID to clipboard
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

  // ====================================
  // STATUS RENDERING FUNCTIONS
  // ====================================

  // Calculate access status with memoization
  const accessInfo = useMemo(() => {
    if (!userProfile) return null

    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null
    const isTrialExpired = trialExpiration ? trialExpiration < now : false

    // Admin always has access
    if (isAdmin) {
      return {
        type: 'admin',
        title: '👑 Administrator Access',
        description: 'You have unlimited administrative access to all features.',
        color: 'purple'
      }
    }

    // Revoked = no access
    if (userProfile.revoked) {
      return {
        type: 'revoked',
        title: '✗ Access Revoked',
        description: 'Your access has been revoked. Contact administrators for assistance.',
        color: 'red'
      }
    }

    // Has trial and trial is active
    if (userProfile.hub_trial && trialExpiration && !isTrialExpired) {
      const timeLeft = Math.ceil((trialExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        type: 'trial',
        title: '🔄 Trial Active',
        description: `Trial expires: ${formatDate(trialExpiration.toISOString())}`,
        additionalInfo: `Time remaining: ${timeLeft} day${timeLeft !== 1 ? 's' : ''}`,
        color: 'blue'
      }
    }

    // Has trial but expired
    if (userProfile.hub_trial && isTrialExpired) {
      return {
        type: 'expired',
        title: '⏰ Trial Expired',
        description: `Your trial expired on ${formatDate(trialExpiration!.toISOString())}. Contact administrators for permanent access.`,
        color: 'red'
      }
    }

    // No trial used yet - permanent access
    if (!userProfile.hub_trial) {
      return {
        type: 'access',
        title: '✓ Full Access',
        description: 'You have permanent access to all premium features.',
        color: 'green'
      }
    }

    // Fallback
    return {
      type: 'pending',
      title: '⏳ Pending Access',
      description: 'Request access in our Discord server.',
      color: 'yellow'
    }
  }, [userProfile, isAdmin])

  // Updated Status Badges
  const statusBadges = useMemo(() => {
    if (!userProfile) return []

    const badges = []
    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null

    if (isAdmin) {
      badges.push({
        key: 'admin',
        icon: Crown,
        text: 'Admin',
        className: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      })
    }

    if (userProfile.revoked) {
      badges.push({
        key: 'revoked',
        icon: XCircle,
        text: 'Access Revoked',
        className: 'bg-red-500/20 text-red-400 border-red-500/30'
      })
    } else if (userProfile.hub_trial) {
      const isTrialActive = trialExpiration && trialExpiration > now

      if (isTrialActive) {
        badges.push({
          key: 'trial',
          icon: Timer,
          text: 'Trial Active',
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        })
      } else {
        badges.push({
          key: 'expired',
          icon: Clock,
          text: 'Trial Expired',
          className: 'bg-red-500/20 text-red-400 border-red-500/30'
        })
      }
    } else {
      badges.push({
        key: 'access',
        icon: CheckCircle,
        text: 'Full Access',
        className: 'bg-green-500/20 text-green-400 border-green-500/30'
      })
    }

    return badges
  }, [userProfile, isAdmin])

  // ====================================
  // RENDER GUARDS
  // ====================================

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <div className="text-xs text-gray-500 p-3 bg-gray-500/10 rounded">
                <p>Debug info for developer:</p>
                <p>Discord ID: {getDiscordId(user)}</p>
                <p>Username: {getUsername(user)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const avatar = getAvatarUrl(user)
  const username = getUsername(user)

  // ====================================
  // MAIN RENDER
  // ====================================

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-text-secondary text-sm sm:text-base">
                Manage your account and view your access status
              </p>
            </div>
            
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              disabled={refreshing}
              className="w-full sm:w-auto"
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

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-background-secondary/50 rounded-xl p-6 sm:p-8 border border-white/10 mb-6 sm:mb-8"
        >
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center md:items-start space-x-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src={avatar}
                alt={username}
                width={120}
                height={120}
                className="rounded-full border-4 border-accent-primary/20"
                priority
              />
              {isAdmin && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{username}</h2>
              
              {/* Discord ID with copy functionality */}
              <div className="flex items-center gap-2 mb-4">
                <p className="text-text-secondary">Discord ID: {userProfile.discord_id}</p>
                <button
                  onClick={copyDiscordId}
                  className="text-accent-primary hover:text-accent-light transition-colors p-1 rounded"
                  title="Copy Discord ID"
                >
                  {copiedDiscordId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {statusBadges.map(({ key, icon: Icon, text, className }) => (
                  <span key={key} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {text}
                  </span>
                ))}
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Member Since</p>
                  <p className="font-medium">{formatDate(userProfile.created_at)}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Last Login</p>
                  <p className="font-medium">{timeAgo(userProfile.last_login)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <Image
                src={avatar}
                alt={username}
                width={100}
                height={100}
                className="rounded-full border-4 border-accent-primary/20"
                priority
              />
              {isAdmin && (
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-accent-primary rounded-full flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <h2 className="text-xl font-bold mb-2">{username}</h2>
            
            {/* Discord ID with copy functionality */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-text-secondary text-sm">ID: {userProfile.discord_id}</p>
              <button
                onClick={copyDiscordId}
                className="text-accent-primary hover:text-accent-light transition-colors p-1 rounded"
                title="Copy Discord ID"
              >
                {copiedDiscordId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            
            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {statusBadges.map(({ key, icon: Icon, text, className }) => (
                <span key={key} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {text}
                </span>
              ))}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary">Member Since</p>
                <p className="font-medium">{formatDate(userProfile.created_at)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Last Login</p>
                <p className="font-medium">{timeAgo(userProfile.last_login)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Access Status Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* Access Status */}
          <div className="bg-background-secondary/30 rounded-xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-accent-primary" />
              Access Status
            </h3>
            
            {accessInfo && (
              <div className="space-y-2">
                <p className={`font-medium ${
                  accessInfo.color === 'purple' ? 'text-purple-400' :
                  accessInfo.color === 'red' ? 'text-red-400' :
                  accessInfo.color === 'blue' ? 'text-blue-400' :
                  accessInfo.color === 'green' ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {accessInfo.title}
                </p>
                <p className="text-text-secondary text-sm">
                  {accessInfo.description}
                </p>
                {accessInfo.additionalInfo && (
                  <p className="text-text-secondary text-sm">
                    {accessInfo.additionalInfo}
                  </p>
                )}
                
                {/* Action buttons for specific states */}
                {accessInfo.type === 'pending' && (
                  <Button 
                    onClick={() => router.push('/whitelist')}
                    className="mt-3 gradient-primary w-full sm:w-auto"
                    size="sm"
                  >
                    Request Access
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Account Activity */}
          <div className="bg-background-secondary/30 rounded-xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-accent-primary" />
              Account Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Logins</span>
                <span className="font-medium">{userProfile.login_count}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Account Created</span>
                <span className="font-medium text-sm sm:text-base">{timeAgo(userProfile.created_at)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Last Active</span>
                <span className="font-medium text-sm sm:text-base">{timeAgo(userProfile.last_login)}</span>
              </div>

              {userProfile.hub_trial && (
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Trial Status</span>
                  <span className="font-medium">
                    {userProfile.trial_expiration 
                      ? (new Date(userProfile.trial_expiration) > new Date() ? 'Active' : 'Expired')
                      : 'Not Started'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Trial Information */}
        {userProfile.hub_trial && userProfile.trial_expiration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background-secondary/30 rounded-xl p-4 sm:p-6 border border-blue-500/20 mb-6 sm:mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-400">
              <Timer className="w-5 h-5 mr-2" />
              Trial Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary text-sm">Trial Started</p>
                <p className="font-medium">{formatDate(userProfile.created_at)}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Trial Expires</p>
                <p className="font-medium">{formatDate(userProfile.trial_expiration)}</p>
              </div>
            </div>
            
            {new Date(userProfile.trial_expiration) < new Date() && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  Your trial has expired. Contact administrators for permanent access or join our Discord.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Admin Panel Access */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-background-secondary/30 rounded-xl p-4 sm:p-6 border border-purple-500/20 mb-6 sm:mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-400">
              <Shield className="w-5 h-5 mr-2" />
              Administrator Panel
            </h3>
            
            <p className="text-text-secondary mb-4">
              You have administrator privileges. Access the admin panel to manage users and view analytics.
            </p>
            
            <Button 
              onClick={() => router.push('/admin')}
              className="gradient-primary w-full sm:w-auto"
            >
              <Shield className="w-4 h-4 mr-2" />
              Open Admin Panel
            </Button>
          </motion.div>
        )}

        {/* Request Access Section */}
        {!hasAccess && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background-secondary/30 rounded-xl p-4 sm:p-6 border border-yellow-500/20"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-400">
              <Clock className="w-5 h-5 mr-2" />
              Need Access?
            </h3>
            
            <p className="text-text-secondary mb-4">
              Join our Discord community to request access or start a trial.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push('/whitelist')}
                className="gradient-primary"
              >
                Request Access
              </Button>
              <Button 
                onClick={() => window.open('https://discord.gg/your-discord', '_blank')}
                variant="outline"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}