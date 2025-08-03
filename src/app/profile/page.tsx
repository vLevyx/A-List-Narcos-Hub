"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Calendar, Clock, Shield, CheckCircle, XCircle, Timer } from 'lucide-react'
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

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const discordId = getDiscordId(user)
        
        if (!discordId) {
          throw new Error('No Discord ID found')
        }

        // FIXED: Only fetch user profile data, don't call upsert_user_login
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
        console.log('✅ Profile loaded successfully')

      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading, router, supabase])

  // Updated Access Status Rendering
  const renderAccessStatus = () => {
    if (!userProfile) return null

    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null
    const isTrialExpired = trialExpiration ? trialExpiration < now : false

    // Admin always has access
    if (isAdmin) {
      return (
        <div className="space-y-2">
          <p className="text-purple-400 font-medium">👑 Administrator Access</p>
          <p className="text-text-secondary text-sm">
            You have unlimited administrative access to all features.
          </p>
        </div>
      )
    }

    // Revoked = no access
    if (userProfile.revoked) {
      return (
        <div className="space-y-2">
          <p className="text-red-400 font-medium">✗ Access Revoked</p>
          <p className="text-text-secondary text-sm">
            Your access has been revoked. Contact administrators for assistance.
          </p>
        </div>
      )
    }

    // Has trial and trial is active
    if (userProfile.hub_trial && trialExpiration && !isTrialExpired) {
      const timeLeft = Math.ceil((trialExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return (
        <div className="space-y-2">
          <p className="text-blue-400 font-medium">🔄 Trial Active</p>
          <p className="text-text-secondary text-sm">
            Trial expires: {formatDate(trialExpiration.toISOString())}
          </p>
          <p className="text-text-secondary text-sm">
            Time remaining: {timeLeft} day{timeLeft !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }

    // Has trial but expired
    if (userProfile.hub_trial && isTrialExpired) {
      return (
        <div className="space-y-2">
          <p className="text-red-400 font-medium">⏰ Trial Expired</p>
          <p className="text-text-secondary text-sm">
            Your trial expired on {formatDate(trialExpiration!.toISOString())}. 
            Contact administrators for permanent access.
          </p>
        </div>
      )
    }

    // No trial used yet - permanent access
    if (!userProfile.hub_trial) {
      return (
        <div className="space-y-2">
          <p className="text-green-400 font-medium">✓ Full Access</p>
          <p className="text-text-secondary text-sm">
            You have permanent access to all premium features.
          </p>
        </div>
      )
    }

    // Fallback
    return (
      <div className="space-y-2">
        <p className="text-yellow-400 font-medium">⏳ Pending Access</p>
        <p className="text-text-secondary text-sm">
          Request access in our Discord server.
        </p>
        <Button 
          onClick={() => router.push('/whitelist')}
          className="mt-3 gradient-primary"
          size="sm"
        >
          Request Access
        </Button>
      </div>
    )
  }

  // Updated Status Badges
  const renderStatusBadges = () => {
    if (!userProfile) return []

    const badges = []
    const now = new Date()
    const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null

    if (isAdmin) {
      badges.push(
        <span key="admin" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      )
    }

    if (userProfile.revoked) {
      badges.push(
        <span key="revoked" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Access Revoked
        </span>
      )
    } else if (userProfile.hub_trial) {
      const isTrialActive = trialExpiration && trialExpiration > now

      if (isTrialActive) {
        badges.push(
          <span key="trial" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Timer className="w-3 h-3 mr-1" />
            Trial Active
          </span>
        )
      } else {
        badges.push(
          <span key="expired" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Trial Expired
          </span>
        )
      }
    } else {
      badges.push(
        <span key="access" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Full Access
        </span>
      )
    }

    return badges
  }

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
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <div className="text-xs text-gray-500">
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

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-text-secondary">
            Manage your account and view your access status
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-background-secondary/50 rounded-xl p-8 border border-white/10 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
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
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{username}</h2>
              <p className="text-text-secondary mb-4">Discord ID: {userProfile.discord_id}</p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {renderStatusBadges()}
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
        </motion.div>

        {/* Access Status Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Access Status */}
          <div className="bg-background-secondary/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-accent-primary" />
              Access Status
            </h3>
            
            {renderAccessStatus()}
          </div>

          {/* Account Activity */}
          <div className="bg-background-secondary/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-accent-primary" />
              Account Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Logins</span>
                <span className="font-medium">{userProfile.login_count}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Account Created</span>
                <span className="font-medium">{timeAgo(userProfile.created_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Last Active</span>
                <span className="font-medium">{timeAgo(userProfile.last_login)}</span>
              </div>

              {userProfile.hub_trial && (
                <div className="flex justify-between">
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
            className="bg-background-secondary/30 rounded-xl p-6 border border-blue-500/20 mb-8"
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
            className="bg-background-secondary/30 rounded-xl p-6 border border-purple-500/20"
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
              className="gradient-primary"
            >
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
            className="bg-background-secondary/30 rounded-xl p-6 border border-yellow-500/20"
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
                Join Discord
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}