"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Users, BarChart3, Settings, ArrowRight, Star, Zap, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const features = [
  {
    icon: Shield,
    title: 'Secure Operations',
    description: 'Advanced security protocols to protect your operations and data',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Comprehensive whitelist and access control system',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights and operational analytics',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Lightning-fast tools built for professional operations',
    color: 'from-yellow-500 to-orange-500'
  }
]

const stats = [
  { label: 'Active Users', value: '2,500+' },
  { label: 'Operations Completed', value: '15K+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Security Level', value: 'Military Grade' }
]

export default function HomePage() {
  usePageTracking()
  const { user, loading, signInWithDiscord, hasAccess } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">A-List</span>
              <br />
              <span className="text-white">Narcos Hub</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Premium tools and secure infrastructure for professional narcos operations. 
              Built for those who demand excellence and reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                hasAccess ? (
                  <Link href="/profile">
                    <Button size="lg" className="gradient-primary text-white font-semibold px-8 py-4">
                      Access Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/whitelist">
                    <Button size="lg" variant="outline" className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white px-8 py-4">
                      Request Access
                      <Lock className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )
              ) : (
                <Button 
                  onClick={signInWithDiscord}
                  size="lg" 
                  className="gradient-primary text-white font-semibold px-8 py-4"
                >
                  Sign In with Discord
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-background-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Professional Grade <span className="gradient-text">Tools</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Everything you need for successful operations, backed by military-grade security 
              and built for professionals who accept nothing but the best.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="card-hover bg-background-secondary/50 p-6 rounded-xl"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Elevate</span> Your Operations?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join the elite network of professionals who trust A-List Narcos Hub 
              for their most critical operations.
            </p>
            {!user && (
              <Button 
                onClick={signInWithDiscord}
                size="lg" 
                className="gradient-primary text-white font-semibold px-8 py-4"
              >
                Get Started Today
                <Star className="ml-2 w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}