import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { User } from '@supabase/supabase-js'

// Fix: Only keep ONE cn function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get Discord ID from user object
export function getDiscordId(user: User | null): string | null {
  if (!user) return null
  
  // Try different possible locations for Discord ID
  return (
    user.user_metadata?.provider_id ||
    user.user_metadata?.sub ||
    user.id ||
    null
  )
}

// Get username from user object
export function getUsername(user: User | null): string {
  if (!user) return 'Unknown User'
  
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.user_metadata?.preferred_username ||
    user.email?.split('@')[0] ||
    'Unknown User'
  )
}

// Get Discord avatar URL
export function getAvatarUrl(user: User | null): string {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  
  const discordId = getDiscordId(user)
  const avatar = user.user_metadata?.avatar_url
  
  if (avatar && discordId) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=256`
  }
  
  return user.user_metadata?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'
}

// Format date utilities
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Invalid Date'
  }
}

export function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return formatDate(dateString)
  } catch {
    return 'Invalid Date'
  }
}

// Check if user is admin (client-side helper)
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false
  
  const discordId = getDiscordId(user)
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(',') || []
  
  return discordId ? adminIds.includes(discordId) : false
}

// Check if user has middleman privileges
export function isUserMiddleman(user: User | null): boolean {
  if (!user) return false
  
  // For now, middleman = admin, but you can expand this
  return isUserAdmin(user)
}

// Connection speed detection
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  if (!connection) return false
  
  // Consider 2G or slow-2g as slow
  return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g'
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Validate Discord ID format
export function isValidDiscordId(id: string): boolean {
  return /^\d{17,19}$/.test(id)
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

// Local storage helpers with error handling
export function getFromStorage(key: string, fallback: any = null) {
  if (typeof window === 'undefined') return fallback
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function setToStorage(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// Error formatting
export function formatError(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error_description) return error.error_description
  return 'An unknown error occurred'
}

// URL validation
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Percentage calculation
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100
}