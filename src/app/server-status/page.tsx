'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Users, 
  Globe, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react'

// Server configuration - moved outside component for performance
const SERVER_ID = "33065536"
const SERVER_NAME = "Narcos Life"
const UPDATE_INTERVAL = 60000 // 1 minute in milliseconds

// Country name mapping optimized for performance
const COUNTRY_NAMES: Record<string, string> = {
  us: "United States", ca: "Canada", gb: "United Kingdom", de: "Germany",
  fr: "France", nl: "Netherlands", au: "Australia", ru: "Russia",
  se: "Sweden", no: "Norway", fi: "Finland", es: "Spain",
  it: "Italy", br: "Brazil", jp: "Japan", kr: "South Korea",
  unk: "Unknown"
} as const

// Server data interface
interface ServerData {
  name: string
  status: string
  players: number
  maxPlayers: number
  country?: string
  region?: string
  map?: string
  gameMode?: string
  version?: string
}

// Error boundary for failed server requests
const ServerStatusCard = ({ 
  server, 
  isLoading, 
  error,
  getCapacityClass,
  lastUpdated 
}: {
  server: ServerData | null
  isLoading: boolean
  error: string | null
  getCapacityClass: (percentage: number) => string
  lastUpdated: string
}) => {
  const isOnline = server?.status === 'online'
  const players = server?.players || 0
  const maxPlayers = server?.maxPlayers || 128
  const percentage = Math.min((players / maxPlayers) * 100, 100)
  const countryCode = server?.country?.toLowerCase() || 'unk'
  const region = server?.region
  const location = region || COUNTRY_NAMES[countryCode] || "Unknown"

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-secondary/50 backdrop-blur-xl border border-red-500/20 rounded-xl p-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-400">Connection Error</h3>
          <p className="text-text-secondary">{error}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background-secondary/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 hover:border-accent-primary/30 transition-all duration-300"
    >
      {/* Server Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            {server?.name || SERVER_NAME}
          </h2>
          <p className="text-text-secondary">Arma Reforger Server</p>
        </div>
        
        <div className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${
          isOnline 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isOnline ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Server Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Players */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-accent-primary" />
            <span className="text-sm text-text-secondary uppercase tracking-wider">Players</span>
          </div>
          <div className="text-2xl font-bold text-text-primary" aria-live="polite">
            {isLoading ? '•••' : `${players}/${maxPlayers}`}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-accent-primary" />
            <span className="text-sm text-text-secondary uppercase tracking-wider">Location</span>
          </div>
          <div className="text-xl font-semibold text-text-primary flex items-center gap-2">
            {location}
            {countryCode && countryCode !== 'unk' && (
              <Image 
                src={`https://flagcdn.com/h20/${countryCode}.png`}
                alt={`${COUNTRY_NAMES[countryCode] || countryCode} flag`}
                width={20}
                height={15}
                className="rounded-sm"
                loading="lazy"
                unoptimized={true}
              />
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-accent-primary" />
            <span className="text-sm text-text-secondary uppercase tracking-wider">Capacity</span>
          </div>
          <div className="text-xl font-semibold text-text-primary" aria-live="polite">
            {isLoading ? '•••' : `${Math.round(percentage)}%`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Server Population</span>
          <span className="text-sm text-text-secondary" aria-live="polite">
            {isLoading ? 'Loading...' : `${Math.round(percentage)}% full`}
          </span>
        </div>
        <div 
          className="h-2 bg-white/10 rounded-full overflow-hidden" 
          role="progressbar" 
          aria-valuenow={percentage} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <motion.div 
            className={`h-full rounded-full ${getCapacityClass(percentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${isLoading ? 0 : percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Additional Server Info */}
      {server && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {server.map && (
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">Map</span>
              <div className="text-sm font-medium text-text-primary">{server.map}</div>
            </div>
          )}
          {server.gameMode && (
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider">Game Mode</span>
              <div className="text-sm font-medium text-text-primary">{server.gameMode}</div>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <RefreshCw className="w-3 h-3" />
          <span aria-live="polite">
            Last updated: {lastUpdated || 'Never'}
          </span>
        </div>
        
        {isOnline && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-background-secondary/50 backdrop-blur-xl border border-white/10 rounded-xl p-8"
  >
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-white/10 rounded w-48 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-32"></div>
        </div>
        <div className="h-8 bg-white/5 rounded w-20"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="h-4 bg-white/5 rounded w-16 mb-2"></div>
            <div className="h-6 bg-white/10 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div>
        <div className="flex justify-between mb-2">
          <div className="h-3 bg-white/5 rounded w-24"></div>
          <div className="h-3 bg-white/5 rounded w-16"></div>
        </div>
        <div className="h-2 bg-white/5 rounded-full"></div>
      </div>
    </div>
  </motion.div>
)

export default function NarcosServerStatusPage() {
  // Note: Removed usePageTracking to make this a truly public page
  // If you want to track anonymous visitors, you can add it back with proper handling

  // State management
  const [serverData, setServerData] = useState<ServerData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refs for cleanup
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  // Memoized capacity class function
  const getCapacityClass = useCallback((percentage: number): string => {
    if (percentage <= 30) return 'bg-gradient-to-r from-accent-primary to-accent-secondary'
    if (percentage <= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (percentage <= 85) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }, [])

  // Optimized fetch using our API route to avoid CORS issues
  const fetchServerData = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Use our API route instead of direct BattleMetrics API call
      const response = await fetch('/api/server-status', {
        signal: AbortSignal.any([abortControllerRef.current.signal, controller.signal]),
        headers: {
          'Accept': 'application/json',
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const serverData = await response.json()
      
      if (!isMountedRef.current) return
      
      // Check if response contains error
      if (serverData.error) {
        throw new Error(serverData.message || 'Server returned an error')
      }
      
      setServerData({
        name: serverData.name || SERVER_NAME,
        status: serverData.status || 'offline',
        players: serverData.players || 0,
        maxPlayers: serverData.maxPlayers || 128,
        country: serverData.country,
        region: serverData.region,
        map: serverData.map,
        gameMode: serverData.gameMode,
        version: serverData.version
      })
      
      setLastUpdated(new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }))
      
    } catch (err) {
      if (!isMountedRef.current) return
      
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching server data:', err)
        setError(`Unable to connect to server: ${err.message}`)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initialize and set up polling
  useEffect(() => {
    isMountedRef.current = true
    fetchServerData()
    
    // Set up interval for updates every minute
    updateIntervalRef.current = setInterval(fetchServerData, UPDATE_INTERVAL)
    
    return () => {
      isMountedRef.current = false
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchServerData])

  // Handle page visibility to pause updates when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isMountedRef.current) return
      
      if (document.hidden) {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
        }
      } else {
        fetchServerData()
        updateIntervalRef.current = setInterval(fetchServerData, UPDATE_INTERVAL)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchServerData])

  return (
    <div className="min-h-screen py-8 px-4 relative">
      {/* Enhanced Background Effects - matching your project style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="gradient-text">Narcos Life</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Live Server Status - Real-time player information and server statistics
          </p>
        </motion.header>

        {/* Server Status Card */}
        <main aria-label="Server Status Information">
          {isLoading && !serverData ? (
            <LoadingSkeleton />
          ) : (
            <ServerStatusCard 
              server={serverData}
              isLoading={isLoading}
              error={error}
              getCapacityClass={getCapacityClass}
              lastUpdated={lastUpdated}
            />
          )}
        </main>

        {/* Connection Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="bg-background-secondary/30 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-text-secondary mb-2">
              Updates automatically every minute • Data provided by BattleMetrics
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
              <span>Server ID: {SERVER_ID}</span>
              <span>•</span>
              <span>Arma Reforger</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}