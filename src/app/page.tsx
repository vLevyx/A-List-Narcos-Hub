"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Users, BarChart3, Settings, ArrowRight, Star, Zap, Lock, Crown, Gamepad2, Globe } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const features = [
  {
    icon: Crown,
    title: 'Elite Roleplay',
    description: 'High-quality narcos roleplay with authentic storylines and character development',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Users,
    title: 'Community Management',
    description: 'Comprehensive member system with exclusive access controls',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Shield,
    title: 'Secure Operations',
    description: 'Advanced security protocols to protect server integrity and member privacy',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Gamepad2,
    title: 'Immersive Experience',
    description: 'Cutting-edge tools and systems for the ultimate roleplay experience',
    color: 'from-orange-500 to-amber-500'
  }
]

const stats = [
  { label: 'Active Members', value: '150+' },
  { label: 'Monthly Events', value: '25+' },
  { label: 'Server Uptime', value: '99.9%' },
  { label: 'Community Rating', value: '★★★★★' }
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
        <LoadingSpinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10" />
        <div className="absolute inset-0 bg-gradient-dark opacity-50" />
        
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
              The premier destination for elite narcos roleplay. Experience authentic storylines, 
              professional operations, and a tight-knit community of dedicated players.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                hasAccess ? (
                  <Link href="/profile">
                    <Button size="lg" className="gradient-primary text-white font-semibold px-8 py-4 purple-glow-hover">
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
                  className="gradient-primary text-white font-semibold px-8 py-4 purple-glow-hover"
                >
                  Join the Family
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Globe className="w-4 h-4" />
                <span>24/7 Active Community</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-background-secondary/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <div className="text-text-secondary group-hover:text-accent-light transition-colors">
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
              Premium <span className="gradient-text">Roleplay</span> Experience
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Step into the world of high-stakes narcos operations with our immersive roleplay server. 
              Every detail crafted for authenticity and excitement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="card-hover bg-background-secondary/50 p-6 rounded-xl group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-accent-light transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="px-4 py-20 bg-gradient-dark border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Join the <span className="gradient-text">Elite</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Ready to experience the most immersive narcos roleplay server? 
              Our exclusive community is waiting for dedicated players who appreciate quality storytelling.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
                <Crown className="w-8 h-8 text-accent-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Exclusive Access</h3>
                <p className="text-text-secondary text-sm">
                  Curated membership ensures quality roleplay experiences
                </p>
              </div>
              
              <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
                <Users className="w-8 h-8 text-accent-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Active Community</h3>
                <p className="text-text-secondary text-sm">
                  Engaged players online 24/7 across all time zones
                </p>
              </div>
              
              <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
                <Zap className="w-8 h-8 text-accent-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Regular Events</h3>
                <p className="text-text-secondary text-sm">
                  Scheduled operations and storylines keep the action fresh
                </p>
              </div>
            </div>

            {!user && (
              <Button 
                onClick={signInWithDiscord}
                size="lg" 
                className="gradient-primary text-white font-semibold px-8 py-4 purple-glow-hover"
              >
                Start Your Journey
                <Star className="ml-2 w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="gradient-text">Membership</span> Requirements
            </h2>
            <p className="text-text-secondary">
              We maintain high standards to ensure the best roleplay experience for everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background-secondary/50 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-accent-primary" />
                Basic Requirements
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Active Discord account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">18+ years old (mature content)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Commitment to quality roleplay</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Respect for community guidelines</span>
                </li>
              </ul>
            </div>

            <div className="bg-background-secondary/50 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-accent-primary" />
                What You Get
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Access to all server features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Exclusive member-only events</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Priority support and assistance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-text-secondary">Voice in community decisions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}