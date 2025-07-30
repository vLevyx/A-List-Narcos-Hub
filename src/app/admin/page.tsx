"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  BarChart3, 
  FileText, 
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  Eye,
  Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePageTracking } from '@/hooks/usePageTracking'
import { createClient } from '@/lib/supabase/client'
import { getDiscordId, formatDate, timeAgo, formatNumber } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

// Types
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

interface PageSession {
  id: string
  discord_id: string
  username: string | null
  page_path: string
  enter_time: string | null
  exit_time: string | null
  time_spent_seconds: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

type TabType = 'users' | 'analytics' | 'logs'
type UserStatusFilter = 'all' | 'access' | 'trial' | 'revoked' | 'pending'

export default function AdminDashboard() {
  usePageTracking()
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const supabase = createClient()

  // State
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithAccess[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
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
    analytics: false,
    action: false
  })
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check admin access
  useEffect(() => {
    if (authLoading) return
    
    if (!user || !isAdmin) {
      router.push('/')
      return
    }
    
    setLoading(false)
  }, [user, authLoading, isAdmin, router])

  // Load users
  const loadUsers = useCallback(async (
    page: number = 1, 
    limit: number = 20, 
    search: string = '', 
    statusFilter: UserStatusFilter = 'all'
  ) => {
    try {
      setLoadingState(prev => ({ ...prev, users: true }))
      
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
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

      if (error) throw error

      // Calculate access status for each user
      const usersWithAccess: UserWithAccess[] = (data || []).map(user => {
        const now = new Date()
        const isTrialActive = user.hub_trial && 
          user.trial_expiration && 
          new Date(user.trial_expiration) > now
        
        const hasAccess = !user.revoked && isTrialActive

        return {
          ...user,
          hasAccess,
          isTrialActive: isTrialActive || false
        }
      })

      setUsers(usersWithAccess)
    } catch (error) {
      console.error('Error loading users:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, users: false }))
    }
  }, [supabase])

  // Load logs
  const loadLogs = useCallback(async (page: number = 1, limit: number = 50) => {
    try {
      setLoadingState(prev => ({ ...prev, logs: true }))
      
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading logs:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load logs: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, logs: false }))
    }
  }, [supabase])

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, analytics: true }))
      
      // Get basic user stats
      const { data: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { data: activeTrials } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('hub_trial', true)
        .eq('revoked', false)

      const { data: revokedUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('revoked', true)

      // Get recent activity
      const { data: recentSessions } = await supabase
        .from('page_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setAnalytics({
        totalUsers: totalUsers?.length || 0,
        activeTrials: activeTrials?.length || 0,
        revokedUsers: revokedUsers?.length || 0,
        recentSessions: recentSessions || []
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      setStatusMessage({
        type: 'error',
        message: `Failed to load analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setLoadingState(prev => ({ ...prev, analytics: false }))
    }
  }, [supabase])

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

  // Perform user action
  const performUserAction = async (targetDiscordId: string, action: string) => {
    if (!user) return

    try {
      setLoadingState(prev => ({ ...prev, action: true }))
      
      const adminId = getDiscordId(user)
      const adminName = user.user_metadata?.full_name || user.user_metadata?.name || 'Admin'
      
      if (!adminId) {
        throw new Error('Could not determine admin ID')
      }

      let description = ''
      let updateData: any = {}

      switch (action) {
        case 'WHITELIST':
          description = `Granted access to user ${targetDiscordId}`
          updateData = { revoked: false }
          break
        case 'REVOKE':
          description = `Revoked access for user ${targetDiscordId}`
          updateData = { revoked: true }
          break
        case 'TRIAL_7':
          description = `Added 7-day trial for user ${targetDiscordId}`
          const trialExpiration7 = new Date()
          trialExpiration7.setDate(trialExpiration7.getDate() + 7)
          updateData = {
            hub_trial: true,
            trial_expiration: trialExpiration7.toISOString()
          }
          break
        case 'TRIAL_30':
          description = `Added 30-day trial for user ${targetDiscordId}`
          const trialExpiration30 = new Date()
          trialExpiration30.setDate(trialExpiration30.getDate() + 30)
          updateData = {
            hub_trial: true,
            trial_expiration: trialExpiration30.toISOString()
          }
          break
        default:
          throw new Error('Invalid action')
      }

      // Update user
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('discord_id', targetDiscordId)

      if (updateError) throw updateError

      // Log action
      const { error: logError } = await supabase.from('admin_logs').insert([{
        admin_id: adminId,
        admin_name: adminName,
        action,
        target_discord_id: targetDiscordId,
        description,
        created_at: new Date().toISOString()
      }])

      if (logError) {
        console.error('Failed to log action:', logError)
      }

      setStatusMessage({
        type: 'success',
        message: `Successfully performed ${action.toLowerCase()} action`
      })

      // Refresh users
      await loadUsers(userPage, userLimit, userSearch, userStatusFilter)
      
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

  // Initial load
  useEffect(() => {
    if (loading || !isAdmin) return
    
    loadUsers()
    loadLogs()
    loadAnalytics()
  }, [loading, isAdmin, loadUsers, loadLogs, loadAnalytics])

  // Filter change handler
  useEffect(() => {
    if (loading) return
    setUserPage(1)
    loadUsers(1, userLimit, userSearch, userStatusFilter)
  }, [userStatusFilter, loading, loadUsers, userLimit, userSearch])

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
              Manage users, view analytics, and monitor system activity
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => {
                loadUsers(userPage, userLimit, userSearch, userStatusFilter)
                loadLogs()
                loadAnalytics()
              }}
              variant="outline"
              disabled={loadingState.users || loadingState.logs || loadingState.analytics}
            >
              {loadingState.users || loadingState.logs || loadingState.analytics ? (
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
          <div
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
            {statusMessage.message}
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Users</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalUsers)}</p>
                </div>
                <Users className="w-8 h-8 text-accent-primary" />
              </div>
            </div>

            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active Trials</p>
                  <p className="text-2xl font-bold text-blue-400">{formatNumber(analytics.activeTrials)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Revoked Users</p>
                  <p className="text-2xl font-bold text-red-400">{formatNumber(analytics.revokedUsers)}</p>
                </div>
                <UserX className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-400">{formatNumber(analytics.recentSessions.length)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex space-x-6">
            {[
              { key: 'users', label: 'User Management', icon: Users },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'logs', label: 'Audit Logs', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`pb-3 px-1 font-medium flex items-center space-x-2 ${
                  activeTab === key
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-white/60 hover:text-white/80'
                }`}
                onClick={() => setActiveTab(key as TabType)}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-background-secondary/50 rounded-xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
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
                        <tr key={user.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-white">{user.username || 'Unknown'}</p>
                              <p className="text-sm text-text-secondary">{user.discord_id}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {user.revoked ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                <XCircle className="w-3 h-3 mr-1" />
                                Revoked
                              </span>
                            ) : user.hasAccess ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Access Granted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                No Access
                              </span>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <p className="text-sm text-white">
                              {user.last_login ? timeAgo(user.last_login) : 'Never'}
                            </p>
                          </td>
                          
                          <td className="p-4">
                            <p className="text-sm text-white">{user.login_count}</p>
                          </td>
                          
                          <td className="p-4">
                            {user.hub_trial ? (
                              <div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.isTrialActive
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  <Clock className="w-3 h-3 mr-1" />
                                  {user.isTrialActive ? 'Active Trial' : 'Trial Expired'}
                                </span>
                                {user.trial_expiration && (
                                  <p className="text-xs text-text-secondary mt-1">
                                    {user.isTrialActive ? 'Expires' : 'Expired'}: {formatDate(user.trial_expiration)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-text-secondary">No Trial</span>
                            )}
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {!user.revoked ? (
                                <Button
                                  onClick={() => performUserAction(user.discord_id, 'REVOKE')}
                                  variant="destructive"
                                  size="sm"
                                  disabled={loadingState.action}
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  Revoke
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => performUserAction(user.discord_id, 'WHITELIST')}
                                  variant="outline"
                                  size="sm"
                                  disabled={loadingState.action}
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Restore
                                </Button>
                              )}
                              
                              <Button
                                onClick={() => performUserAction(user.discord_id, 'TRIAL_7')}
                                variant="ghost"
                                size="sm"
                                disabled={loadingState.action}
                              >
                                7d Trial
                              </Button>
                              
                              <Button
                                onClick={() => performUserAction(user.discord_id, 'TRIAL_30')}
                                variant="ghost"
                                size="sm"
                                disabled={loadingState.action}
                              >
                                30d Trial
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

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-text-secondary">
                Showing {Math.min((userPage - 1) * userLimit + 1, filteredUsers.length)} to{' '}
                {Math.min(userPage * userLimit, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    const newPage = userPage - 1
                    setUserPage(newPage)
                    loadUsers(newPage, userLimit, userSearch, userStatusFilter)
                  }}
                  variant="outline"
                  size="sm"
                  disabled={userPage === 1 || loadingState.users}
                >
                  Previous
                </Button>
                
                <span className="px-3 py-1 bg-background-secondary rounded text-sm">
                  {userPage}
                </span>
                
                <Button
                  onClick={() => {
                    const newPage = userPage + 1
                    setUserPage(newPage)
                    loadUsers(newPage, userLimit, userSearch, userStatusFilter)
                  }}
                  variant="outline"
                  size="sm"
                  disabled={filteredUsers.length < userLimit || loadingState.users}
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-background-secondary/50 rounded-xl p-8 border border-white/10 text-center">
              <BarChart3 className="w-16 h-16 text-accent-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-text-secondary">
                Detailed analytics and reporting features are coming soon. This will include user activity, 
                session analytics, and comprehensive reporting tools.
              </p>
            </div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-background-secondary/50 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-primary/50">
                    <tr>
                      <th className="p-4 text-left text-accent-primary font-medium">Timestamp</th>
                      <th className="p-4 text-left text-accent-primary font-medium">Admin</th>
                      <th className="p-4 text-left text-accent-primary font-medium">Action</th>
                      <th className="p-4 text-left text-accent-primary font-medium">Target</th>
                      <th className="p-4 text-left text-accent-primary font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingState.logs ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <LoadingSpinner size="md" className="mx-auto" />
                          <p className="mt-2 text-white/60">Loading logs...</p>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-white/60">
                          No admin logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <p className="text-sm text-white">
                              {log.created_at ? formatDate(log.created_at) : 'Unknown'}
                            </p>
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-accent-primary" />
                              <p className="text-sm text-white">{log.admin_name || 'Unknown Admin'}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.action === 'WHITELIST'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : log.action === 'REVOKE'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : log.action?.includes('TRIAL')
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {log.action || 'UNKNOWN'}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <p className="text-sm text-white font-mono">
                              {log.target_discord_id || 'N/A'}
                            </p>
                          </td>
                          
                          <td className="p-4">
                            <p className="text-sm text-text-secondary">
                              {log.description || 'No description'}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}