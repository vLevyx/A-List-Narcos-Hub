"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

export default function WhitelistPage() {
  usePageTracking()
  const router = useRouter()
  const { user, loading: authLoading, hasAccess, isTrialActive } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/')
      return
    }
    
    setLoading(false)
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

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
            <span className="gradient-text">Whitelist</span>
          </h1>
          <p className="text-text-secondary">
            Request access to A-List Narcos Hub premium features
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-background-secondary/50 rounded-xl p-8 border border-white/10 mb-8"
        >
          <div className="text-center">
            {hasAccess ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-400">Access Granted!</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  You have full access to all A-List Narcos Hub features. Welcome to the premium experience!
                </p>
                <Button onClick={() => router.push('/profile')} className="gradient-primary">
                  Go to Profile
                </Button>
              </div>
            ) : isTrialActive ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-blue-400">Trial Active</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  You're currently on a trial period. Enjoy exploring our features! 
                  Contact an admin for permanent access.
                </p>
                <Button onClick={() => router.push('/profile')} className="gradient-primary">
                  View Trial Status
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400">Access Required</h2>
                <p className="text-text-secondary max-w-md mx-auto">
                  You don't currently have access to A-List Narcos Hub. 
                  Please contact an administrator to request access.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact Methods */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Discord Server</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Join our Discord server and contact an administrator directly for the fastest response.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord (Coming Soon)
              </Button>
            </div>

            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Direct Contact</h3>
              </div>
              <p className="text-text-secondary mb-4">
                Contact one of our administrators directly if you need immediate assistance.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-text-secondary">Available Administrators:</p>
                <ul className="text-accent-primary space-y-1">
                  <li>• Levy (Primary Admin)</li>
                  <li>• AK (Senior Admin)</li>
                  <li>• Stagger (Admin)</li>
                  <li>• Chee (Admin)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-background-secondary/50 rounded-xl p-8 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Access Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-accent-primary">For Regular Access:</h4>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Active Discord account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Verification by an administrator</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Agreement to terms and conditions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Professional conduct expected</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-accent-primary">What You Get:</h4>
              <ul className="space-y-2 text-text-secondary">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                  <span>Full access to all premium tools</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                  <span>Priority support and updates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                  <span>Access to exclusive features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                  <span>Community access and networking</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium mb-1">Important Notice</p>
                <p className="text-text-secondary text-sm">
                  Access is granted at the discretion of our administrators. 
                  All users must comply with our terms of service and community guidelines. 
                  Violation of rules may result in access revocation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}