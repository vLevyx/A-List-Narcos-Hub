'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Users, 
  Globe, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Clock,
  Server,
  MapPin,
  Gamepad2
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

// Enhanced status indicator component
const StatusIndicator = ({ 
  isOnline, 
  isLoading, 
  className = "" 
}: { 
  isOnline: boolean
  isLoading: boolean
  className?: string 
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="hidden sm:inline">Checking...</span>
        <span className="sm:hidden">•••</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider ${
        isOnline 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      } ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="hidden sm:inline">Online</span>
          <span className="sm:hidden">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="hidden sm:inline">Offline</span>
          <span className="sm:hidden">Off</span>
        </>
      )}
      {isOnline && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />
      )}
    </motion.div>
  )
}



// Enhanced server status card component
const ServerStatusCard = ({ 
  server, 
  isLoading, 
  error,
  getCapacityClass,
  lastUpdated,
  onRefresh 
}: {
  server: ServerData | null
  isLoading: boolean
  error: string | null
  getCapacityClass: (percentage: number) => string
  lastUpdated: string
  onRefresh: () => void
}) => {
  const isOnline = server?.status === 'online'
  const players = server?.players || 0
  const maxPlayers = server?.maxPlayers || 128
  const percentage = Math.min((players / maxPlayers) * 100, 100)
  const countryCode = server?.country?.toLowerCase() || 'unk'
  const region = server?.region
  const location = region || COUNTRY_NAMES[countryCode] || "Unknown"

  // Memoize server stats to prevent unnecessary re-renders
  const serverStats = useMemo(() => [
    {
      icon: Users,
      label: 'Players',
      value: isLoading ? '•••' : `${players}/${maxPlayers}`,
      description: 'Currently online'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: location,
      description: 'Server region',
      flag: countryCode && countryCode !== 'unk' ? countryCode : null
    },
    {
      icon: Activity,
      label: 'Capacity',
      value: isLoading ? '•••' : `${Math.round(percentage)}%`,
      description: 'Server load'
    }
  ], [isLoading, players, maxPlayers, percentage, location, countryCode])

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-secondary/50 backdrop-blur-xl border border-red-500/20 rounded-xl p-4 sm:p-6 lg:p-8"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-red-400">Connection Error</h3>
          <p className="text-text-secondary text-sm sm:text-base">{error}</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background-secondary/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-accent-primary/30 transition-all duration-300"
    >
      {/* Server Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1 truncate">
            {server?.name || SERVER_NAME}
          </h2>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Server className="w-4 h-4 flex-shrink-0" />
            <span>Arma Reforger Server</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusIndicator isOnline={isOnline} isLoading={isLoading} />
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-primary/30 transition-all duration-200 disabled:opacity-50"
            title="Refresh server status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Server Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
        {serverStats.map(({ icon: Icon, label, value, description, flag }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-text-secondary uppercase tracking-wider">
                {label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary" aria-live="polite">
                {value}
              </div>
              {flag && (
                <Image 
                  src={`https://flagcdn.com/h20/${flag}.png`}
                  alt={`${COUNTRY_NAMES[flag] || flag} flag`}
                  width={20}
                  height={15}
                  className="rounded-sm flex-shrink-0"
                  loading="lazy"
                  unoptimized={true}
                />
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">{description}</p>
          </motion.div>
        ))}
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
          className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden" 
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
      <AnimatePresence>
        {server && (server.map || server.gameMode) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mb-4 border-t border-white/10"
          >
            {server.map && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-3 h-3 text-accent-primary" />
                  <span className="text-xs text-text-secondary uppercase tracking-wider">Map</span>
                </div>
                <div className="text-sm font-medium text-text-primary">{server.map}</div>
              </div>
            )}
            {server.gameMode && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="w-3 h-3 text-accent-primary" />
                  <span className="text-xs text-text-secondary uppercase tracking-wider">Game Mode</span>
                </div>
                <div className="text-sm font-medium text-text-primary">{server.gameMode}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-white/10">
        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Clock className="w-3 h-3" />
          <span aria-live="polite">
            Last updated: {lastUpdated || 'Never'}
          </span>
        </div>
        
        {/* Server ID and Live indicator */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-text-secondary">
            Server ID: {SERVER_ID}
          </div>
          
          {/* Live indicator */}
          {isOnline && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced loading skeleton component
const LoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-background-secondary/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8"
  >
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="h-6 sm:h-8 bg-white/10 rounded w-3/4 sm:w-48 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-1/2 sm:w-32"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 bg-white/5 rounded w-20"></div>
          <div className="h-8 w-8 bg-white/5 rounded"></div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
            <div className="h-4 bg-white/5 rounded w-16 mb-2"></div>
            <div className="h-5 sm:h-6 bg-white/10 rounded w-20"></div>
            <div className="h-3 bg-white/5 rounded w-24 mt-1"></div>
          </div>
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div>
        <div className="flex justify-between mb-2">
          <div className="h-3 bg-white/5 rounded w-24"></div>
          <div className="h-3 bg-white/5 rounded w-16"></div>
        </div>
        <div className="h-2 sm:h-3 bg-white/5 rounded-full"></div>
      </div>

      {/* Footer skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t border-white/10">
        <div className="h-3 bg-white/5 rounded w-32"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-white/5 rounded w-16"></div>
          <div className="h-6 bg-white/5 rounded w-20"></div>
        </div>
      </div>
    </div>
  </motion.div>
)

export default function NarcosServerStatusPage() {
  // State management
  const [serverData, setServerData] = useState<ServerData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true)
  
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
  const fetchServerData = useCallback(async (isManualRefresh: boolean = false) => {
    if (!isMountedRef.current) return

    try {
      if (isManualRefresh) {
        setIsLoading(true)
      }
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

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    fetchServerData(true)
  }, [fetchServerData])

  // Initialize and set up polling
  useEffect(() => {
    isMountedRef.current = true
    fetchServerData(true)
    
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

  // Auto-refresh interval management
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      updateIntervalRef.current = setInterval(() => fetchServerData(false), UPDATE_INTERVAL)
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [isAutoRefreshEnabled, fetchServerData])

  // Handle page visibility to pause updates when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isMountedRef.current) return
      
      if (document.hidden) {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current)
        }
      } else if (isAutoRefreshEnabled) {
        fetchServerData(false)
        updateIntervalRef.current = setInterval(() => fetchServerData(false), UPDATE_INTERVAL)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchServerData, isAutoRefreshEnabled])

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 relative">
      {/* Enhanced Background Effects - matching your project style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20" />
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            <span className="gradient-text">Narcos Life</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg px-4">
            Live Server Status - Real-time player information and server statistics
          </p>
        </motion.header>

        {/* Auto-refresh toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center gap-3 bg-background-secondary/30 rounded-lg p-3 border border-white/10">
            <span className="text-sm text-text-secondary">Auto-refresh</span>
            <button
              onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAutoRefreshEnabled ? 'bg-accent-primary' : 'bg-white/20'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                animate={{ x: isAutoRefreshEnabled ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className="text-xs text-text-secondary">
              {isAutoRefreshEnabled ? 'Every minute' : 'Manual only'}
            </span>
          </div>
        </motion.div>

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
              onRefresh={handleManualRefresh}
            />
          )}
        </main>

        {/* Connection Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <div className="bg-background-secondary/30 rounded-lg p-3 sm:p-4 border border-white/10">
            <p className="text-xs sm:text-sm text-text-secondary mb-2">
              {isAutoRefreshEnabled ? 'Updates automatically every minute' : 'Manual refresh only'} • Data provided by BattleMetrics
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-text-secondary">
              <span>Server ID: {SERVER_ID}</span>
              <span className="hidden sm:inline">•</span>
              <span>Arma Reforger</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}