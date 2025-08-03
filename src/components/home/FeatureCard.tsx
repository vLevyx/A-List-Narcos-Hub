'use client'

import Link from 'next/link'
import { Lock, ExternalLink, ArrowRight, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
  title: string
  description?: string
  href: string
  requiresAccess: boolean
  hasAccess: boolean
  tag?: string
  tagType?: 'new' | 'updated' | 'live'
  external?: boolean
}

export function FeatureCard({
  title,
  description,
  href,
  requiresAccess,
  hasAccess,
  tag,
  tagType,
  external = false
}: FeatureCardProps) {
  const isLocked = requiresAccess && !hasAccess
  
  const getTagStyles = (type: 'new' | 'updated' | 'live') => {
    switch (type) {
      case 'new':
        return 'bg-gradient-to-r from-green-500 to-emerald-400 text-white'
      case 'updated':
        return 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white'
      case 'live':
        return 'bg-gradient-to-r from-red-500 to-pink-400 text-white animate-pulse'
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-400 text-white'
    }
  }
  
  const cardContent = (
    <div
      className={cn(
        'relative p-6 rounded-xl border transition-all duration-300 group h-full flex flex-col backdrop-blur-sm',
        isLocked
          ? 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
          : 'bg-white/5 border-purple-500/20 hover:border-purple-500/40 hover:bg-white/10 cursor-pointer card-hover'
      )}
    >
      {/* Tag */}
      {tag && tagType && (
        <div className="absolute -top-3 -right-3 z-10">
          <span
            className={cn(
              'text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1',
              getTagStyles(tagType)
            )}
          >
            {tagType === 'live' && <Activity className="w-3 h-3" />}
            {tag}
          </span>
        </div>
      )}
      
      {/* Icon & Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className={cn(
              'font-bold text-lg leading-tight',
              isLocked ? 'text-white/50' : 'text-white group-hover:text-purple-300 transition-colors'
            )}>
              {title}
            </h3>
          </div>
        </div>
        
        {isLocked ? (
          <Lock className="w-5 h-5 text-purple-500 flex-shrink-0" />
        ) : external ? (
          <ExternalLink className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0" />
        ) : (
          <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
        )}
      </div>
      
      {/* Description */}
      {description && (
        <p className={cn(
          'text-sm leading-relaxed flex-1',
          isLocked ? 'text-white/40' : 'text-white/70 group-hover:text-white/90 transition-colors'
        )}>
          {description}
        </p>
      )}
      
      {/* Access Status */}
      {requiresAccess && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className={cn(
            'inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full',
            hasAccess 
              ? 'status-active'
              : 'status-pending'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              hasAccess ? 'bg-green-400' : 'bg-orange-400'
            )} />
            {hasAccess ? 'Plus Member' : 'Plus Required'}
          </div>
        </div>
      )}
      
      {/* Hover Gradient */}
      {!isLocked && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:via-purple-500/3 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none" />
      )}
    </div>
  )

  if (isLocked) {
    return cardContent
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardContent}
      </a>
    )
  }

  return (
    <Link href={href} className="block h-full">
      {cardContent}
    </Link>
  )
}