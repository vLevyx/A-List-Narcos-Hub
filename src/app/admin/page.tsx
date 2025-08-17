"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  BarChart3, 
  FileText, 
  Search, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
  Settings,
  UserPlus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, formatDate } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { ReferralsSection } from '@/components/admin/ReferralsSection'
import { AnalyticsTab } from '@/components/admin/AnalyticsTab'

// ====================================
// INTERFACES
// ====================================

interface User {
  id: string
  discord_id: string
  username: string | null
  created_at: string
  revoked: boolean
  last_login: string | null
  login_count: number
  hub_trial: boolean
  trial_expiration: string | null
}

interface UserWithAccess extends User {
  hasAccess: boolean
  isTrialActive: boolean
}

interface AdminLog {
  id: string
  admin_id: string | null
  admin_name: string | null
  action: string | null
  target_discord_id: string | null
  description: string | null
  created_at: string | null
}

type TabType = 'users' | 'analytics' | 'logs' | 'referrals'
type UserStatusFilter = 'all' | 'access' | 'trial' | 'revoked' | 'pending'

// ====================================
// MAIN COMPONENT
// ====================================

export default function AdminDashboard() {
  usePageTracking()
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const supabase = createClient()

  // ====================================
  // STATE MANAGEMENT
  // ====================================

  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithAccess[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  
  // Filters and pagination
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('all')
  const [userPage, setUserPage] = useState(1)
  const [userLimit] = useState(20)
  
  // Loading states
  const [loadingState, setLoadingState] = useState({
    users: false,
    logs: false,
    action: false
  })
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ====================================
  // ACCESS CONTROL
  // ====================================

  // Check admin access
  useEffect(() => {
    if (authLoading) return
    
    if (!user || !isAdmin) {
      router.push('/')
      return
    }
    
    setLoading(false)
  }, [user, authLoading, isAdmin, router])

  // ====================================
  // DATA LOADING FUNCTIONS
  // ====================================

  // Load users with proper error handling and admin verification
  const loadUsers = useCallback(async (
    page: number = 1, 
    limit: number = 20, 
    search: string = '', 
    statusFilter: UserStatusFilter = 'all'
  ) => {
    if (!user || !isAdmin) {
      setStatusMessage({
        type: 'error',
        message: 'Admin access required to view users'
      })
      return
    }

    try {
      setLoadingState(prev => ({ ...prev, users: true }))
      
      // First verify admin status server-side using RLS function
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      
      if (adminError) {
        console.error('Admin verification error:', adminError)
        throw new Error('Failed to verify admin status')
      }
      
      if (!adminCheck) {
        throw new Error('Admin privileges required')
      }

      let query = supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      // Apply search filter
      if (search.trim()) {
        query = query.or(`username.ilike.%${search}%,discord_id.ilike.%${search}%`)
      }

      // Apply status filter
      switch (statusFilter) {
        case 'access':
          query = query.eq('revoked', false).eq('hub_trial', false)
          break
        case 'trial':
          query = query.eq('hub_trial', true).eq('revoked', false)
          break
        case 'revoked':
          query = query.eq('revoked', true)
          break
        case 'pending':
          query = query.eq('revoked', false).eq('hub_trial', false)
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Calculate access status for each user with optimized admin check
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []
      const now = new Date()

      const usersWithAccess: UserWithAccess[] = (data || []).map(user => {
        const isTrialActive = user.hub_trial && 
          user.trial_expiration && 
          new Date(user.trial_expiration) > now
        
        // Optimized admin check - use discord_id directly from user object
        const isUserAdmin = adminIds.includes(user.discord_id)
        
        // User has access if they are NOT revoked OR have an active trial OR are admin
        const hasAccess = !user.revoked || isTrialActive || isUserAdmin

        return {
          ...user,
          hasAccess,
          isTrialActive: isTrialActive || false
        }
      })

      setUsers(usersWithAccess)
      
      setStatusMessage({
        type: 'success',
        message: `Loaded ${usersWithAccess.length} users successfully`
      })
    } catch (error) {
      console.error('Error loading users:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, users: false }))
    }
  }, [supabase, user, isAdmin])

  // Load logs with proper admin verification
  const loadLogs = useCallback(async (page: number = 1, limit: number = 50) => {
    if (!user || !isAdmin) {
      setStatusMessage({
        type: 'error',
        message: 'Admin access required to view logs'
      })
      return
    }

    try {
      setLoadingState(prev => ({ ...prev, logs: true }))
      
      // Verify admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }
      
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error('Logs query error:', error)
        throw error
      }

      setLogs(data || [])
      
      setStatusMessage({
        type: 'success',
        message: `Loaded ${(data || []).length} log entries`
      })
    } catch (error) {
      console.error('Error loading logs:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load logs: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, logs: false }))
    }
  }, [supabase, user, isAdmin])

  // ====================================
  // SEARCH AND FILTER HANDLERS
  // ====================================

  // Handle user search with debounce
  const handleUserSearch = useCallback((search: string) => {
    setUserSearch(search)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setUserPage(1)
      loadUsers(1, userLimit, search, userStatusFilter)
    }, 500)
  }, [loadUsers, userLimit, userStatusFilter])

  // ====================================
  // USER ACTIONS
  // ====================================

  // Perform user action
  const performUserAction = async (targetDiscordId: string, action: string) => {
    if (!user) return

    try {
      setLoadingState(prev => ({ ...prev, action: true }))
      
      // Verify admin status first
      const { data: adminCheck, error: adminError } = await supabase.rpc('is_admin')
      
      if (adminError || !adminCheck) {
        throw new Error('Admin privileges required')
      }

      let description = ''

      switch (action) {
        case 'whitelist':
          await supabase.rpc('admin_whitelist_user', { target_discord_id: targetDiscordId })
          description = 'User whitelisted'
          break
        case 'revoke':
          await supabase.rpc('admin_revoke_user', { target_discord_id: targetDiscordId })
          description = 'User revoked'
          break
        case 'trial_7':
          await supabase.rpc('admin_add_trial', { target_discord_id: targetDiscordId, days: 7 })
          description = '7-day trial added'
          break
        case 'trial_30':
          await supabase.rpc('admin_add_trial', { target_discord_id: targetDiscordId, days: 30 })
          description = '30-day trial added'
          break
        default:
          throw new Error('Invalid action')
      }

      setStatusMessage({
        type: 'success',
        message: `Successfully performed action: ${description}`
      })

      // Reload data
      loadUsers(userPage, userLimit, userSearch, userStatusFilter)
      loadLogs()
    } catch (error) {
      console.error('Error performing user action:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to perform action: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, action: false }))
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: null, message: '' })
      }, 3000)
    }
  }

  // ====================================
  // EFFECTS
  // ====================================

  // Initial load
  useEffect(() => {
    if (loading || !isAdmin) return
    
    console.log('Loading initial data...') // Debug log
    loadUsers()
    loadLogs()
  }, [loading, isAdmin, loadUsers, loadLogs])

  // Filter change handler
  useEffect(() => {
    if (loading) return
    setUserPage(1)
    loadUsers(1, userLimit, userSearch, userStatusFilter)
  }, [userStatusFilter, loading, loadUsers, userLimit, userSearch])

  // Clear status message after some time
  useEffect(() => {
    if (statusMessage.type) {
      const timer = setTimeout(() => {
        setStatusMessage({ type: null, message: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

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

  if (!user || !isAdmin) {
    return null
  }

  const filteredUsers = users // Already filtered by backend

  // ====================================
  // MAIN RENDER
  // ====================================

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
            <p className="text-text-secondary">
              Manage users, view analytics, track referrals, and monitor system activity
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => {
                loadUsers(userPage, userLimit, userSearch, userStatusFilter)
                loadLogs()
              }}
              variant="outline"
              disabled={loadingState.users || loadingState.logs}
            >
              {loadingState.users || loadingState.logs ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Status Message */}
        {statusMessage.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-lg ${
              statusMessage.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : statusMessage.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : statusMessage.type === 'warning'
                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            }`}
          >
            <div className="flex items-center">
              {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {statusMessage.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
              {statusMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
              {statusMessage.type === 'info' && <Settings className="w-5 h-5 mr-2" />}
              <p className="font-medium">{statusMessage.message}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-background-secondary/30 p-1 rounded-xl">
          {[
            { key: 'users', label: 'Users', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'logs', label: 'Logs', icon: FileText },
            { key: 'referrals', label: 'Referrals', icon: UserPlus }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabType)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === key
                  ? 'bg-accent-primary text-black shadow-lg shadow-accent-primary/20'
                  : 'text-text-secondary hover:text-white hover:bg-background-secondary/50'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-semibold text-white">User Management</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      placeholder="Search by username or Discord ID"
                      className="w-full pl-10 pr-4 py-2.5 bg-background-primary border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
                    />
                    <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                  </div>
                  
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as UserStatusFilter)}
                    className="px-4 py-2.5 bg-background-primary border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="all">All Users</option>
                    <option value="access">With Access</option>
                    <option value="trial">Trial Users</option>
                    <option value="revoked">Revoked</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-background-secondary/50 rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background-primary/50">
                      <tr>
                        <th className="p-4 text-left text-accent-primary font-medium">User</th>
                        <th className="p-4 text-left text-accent-primary font-medium">Status</th>
                        <th className="p-4 text-left text-accent-primary font-medium">Last Login</th>
                        <th className="p-4 text-left text-accent-primary font-medium">Login Count</th>
                        <th className="p-4 text-left text-accent-primary font-medium">Trial Status</th>
                        <th className="p-4 text-left text-accent-primary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingState.users ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center">
                            <LoadingSpinner size="md" className="mx-auto" />
                            <p className="mt-2 text-white/60">Loading users...</p>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/60">
                            No users found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-background-primary/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-accent-primary font-semibold">
                                    {(user.username || user.discord_id).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {user.username || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-white/60">
                                    ID: {user.discord_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {user.revoked ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Revoked
                                </span>
                              ) : user.hasAccess ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Access
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  No Access
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-white/80">
                              {timeAgo(user.last_login)}
                            </td>
                            <td className="p-4 text-white/80">
                              {user.login_count || 0}
                            </td>
                            <td className="p-4">
                              {user.hub_trial ? (
                                user.isTrialActive ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Active Trial
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expired
                                  </span>
                                )
                              ) : (
                                <span className="text-white/40">No Trial</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {!user.revoked && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => performUserAction(user.discord_id, 'trial_7')}
                                      disabled={loadingState.action}
                                      className="text-xs"
                                    >
                                      7d Trial
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => performUserAction(user.discord_id, 'trial_30')}
                                      disabled={loadingState.action}
                                      className="text-xs"
                                    >
                                      30d Trial
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => performUserAction(user.discord_id, 'whitelist')}
                                      disabled={loadingState.action}
                                      className="text-xs text-green-400 border-green-400/30 hover:bg-green-400/10"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => performUserAction(user.discord_id, user.revoked ? 'whitelist' : 'revoke')}
                                  disabled={loadingState.action}
                                  className={`text-xs ${
                                    user.revoked 
                                      ? 'text-green-400 border-green-400/30 hover:bg-green-400/10'
                                      : 'text-red-400 border-red-400/30 hover:bg-red-400/10'
                                  }`}
                                >
                                  {user.revoked ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsTab />}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Admin Logs</h2>
              
              {loadingState.logs ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="ml-4 text-white/60">Loading logs...</p>
                </div>
              ) : (
                <div className="bg-background-secondary/50 rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background-primary/50">
                        <tr>
                          <th className="p-4 text-left text-accent-primary font-medium">Time</th>
                          <th className="p-4 text-left text-accent-primary font-medium">Admin</th>
                          <th className="p-4 text-left text-accent-primary font-medium">Action</th>
                          <th className="p-4 text-left text-accent-primary font-medium">Target</th>
                          <th className="p-4 text-left text-accent-primary font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-white/60">
                              No admin logs found
                            </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                            <tr key={log.id} className="hover:bg-background-primary/30 transition-colors">
                              <td className="p-4 text-white/80">
                                {formatDate(log.created_at)}
                              </td>
                              <td className="p-4 text-white">
                                {log.admin_name || 'Unknown Admin'}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-primary/20 text-accent-primary">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-4 text-white/80">
                                {log.target_discord_id || 'N/A'}
                              </td>
                              <td className="p-4 text-white/80">
                                {log.description || 'No description'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && <ReferralsSection />}
        </motion.div>
      </div>
    </div>
  )
}