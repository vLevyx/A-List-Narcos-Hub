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
        const discordId = getDiscordId(user)
        
        if (!discordId) {
          throw new Error('No Discord ID found')
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('discord_id', discordId)
          .single()

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`)
        }

        setUserProfile(profileData)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading, router, supabase])

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
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
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
  const trialExpiration = userProfile.trial_expiration ? new Date(userProfile.trial_expiration) : null
  const isTrialExpired = trialExpiration ? trialExpiration < new Date() : false

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
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <Image
                src={avatar}
                alt={`${username}'s avatar`}
                width={120}
                height={120}
                className="rounded-full border-4 border-accent-primary/20"
              />
              {isAdmin && (
                <div className="absolute -bottom-2 -right-2 bg-accent-primary rounded-full p-2">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{username}</h2>
              <p className="text-text-secondary mb-4">
                Discord ID: {userProfile.discord_id}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 mb-4">
                {hasAccess ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Access Granted
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    <XCircle className="w-4 h-4 mr-2" />
                    No Access
                  </span>
                )}

                {isAdmin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                    <Shield className="w-4 h-4 mr-2" />
                    Administrator
                  </span>
                )}

                {isTrialActive && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Timer className="w-4 h-4 mr-2" />
                    Trial Active
                  </span>
                )}
              </div>

              {/* Trial Info */}
              {userProfile.hub_trial && trialExpiration && (
                <div className={`p-4 rounded-lg border ${
                  isTrialExpired 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : isTrialActive
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Timer className="w-4 h-4" />
                    <span className="font-medium">
                      {isTrialExpired ? 'Trial Expired' : 'Trial Status'}
                    </span>
                  </div>
                  <p className="text-sm">
                    {isTrialExpired 
                      ? `Expired ${timeAgo(trialExpiration.toISOString())}`
                      : `Expires ${formatDate(trialExpiration.toISOString())}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10 text-center">
            <Calendar className="w-8 h-8 text-accent-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Member Since</h3>
            <p className="text-text-secondary">
              {formatDate(userProfile.created_at)}
            </p>
          </div>

          <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10 text-center">
            <Clock className="w-8 h-8 text-accent-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Last Login</h3>
            <p className="text-text-secondary">
              {userProfile.last_login ? timeAgo(userProfile.last_login) : 'Never'}
            </p>
          </div>

          <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10 text-center">
            <User className="w-8 h-8 text-accent-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Total Logins</h3>
            <p className="text-text-secondary">
              {userProfile.login_count.toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div className="bg-background-secondary/50 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Need Access?
              </h3>
              <p className="text-text-secondary mb-6">
                Request access to unlock all premium features and tools.
              </p>
              <Button 
                onClick={() => router.push('/whitelist')}
                className="gradient-primary"
              >
                Request Access
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}