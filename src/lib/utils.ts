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
  
  return discordId ? adminIds.includes(discordId.trim()) : false
}

// Format number utility
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

// Simple storage utilities (fallback for localStorage)
export function getFromStorage(key: string): any {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setToStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}