import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { User } from '@supabase/supabase-js'

// Combine class names with Tailwind merge
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

// FIXED: Get Discord avatar URL - corrected the URL construction
export function getAvatarUrl(user: User | null): string {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png'
  
  const discordId = getDiscordId(user)
  const avatarHash = user.user_metadata?.avatar_url
  
  // Check if avatarHash is already a full URL (shouldn't happen but safety check)
  if (avatarHash && avatarHash.startsWith('https://')) {
    return avatarHash
  }
  
  // Construct proper Discord avatar URL
  if (avatarHash && discordId) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
  }
  
  // Fallback to default Discord avatar
  return 'https://cdn.discordapp.com/embed/avatars/0.png'
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

// Additional utility functions for your app
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Storage utilities for caching
export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}