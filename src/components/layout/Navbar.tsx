// SOLUTION 1: Updated Navbar with better SVG handling and fallback options

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { getAvatarUrl, getUsername } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ChevronDown, LogOut, User, Settings, Shield, Menu, X } from "lucide-react"

const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png"

// Discord Icon Component as fallback
const DiscordIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
)

export function Navbar() {
  const { user, loading, signInWithDiscord, signOut, hasAccess, isAdmin } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR)
  const [username, setUsername] = useState<string>("")
  const [avatarLoaded, setAvatarLoaded] = useState<boolean>(false)
  const [iconError, setIconError] = useState<boolean>(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle user data loading
  useEffect(() => {
    if (!user) {
      setAvatarSrc(DEFAULT_AVATAR)
      setUsername("")
      setAvatarLoaded(false)
      return
    }

    const userAvatar = getAvatarUrl(user)
    const userDisplayName = getUsername(user)
    
    setUsername(userDisplayName)
    setAvatarSrc(userAvatar)
  }, [user])

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Handle avatar load error
  const handleAvatarError = () => {
    if (avatarSrc !== DEFAULT_AVATAR) {
      setAvatarSrc(DEFAULT_AVATAR)
    }
    setAvatarLoaded(true)
  }

  const handleAvatarLoad = () => {
    setAvatarLoaded(true)
  }

  const handleIconError = () => {
    setIconError(true)
  }

  const handleSignOut = async () => {
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
    await signOut()
  }

  const navLinks = [
    { href: '/', label: 'Home', public: true },
    { href: '/profile', label: 'Profile', auth: true, access: true },
    { href: '/whitelist', label: 'Whitelist', auth: true },
    { href: '/admin', label: 'Admin', auth: true, admin: true },
  ]

  const filteredNavLinks = navLinks.filter(link => {
    if (link.public) return true
    if (link.auth && !user) return false
    if (link.admin && !isAdmin) return false
    if (link.access && !hasAccess) return false
    return true
  })

  // Discord Login Button Component
  const DiscordLoginButton = ({ mobile = false }: { mobile?: boolean }) => (
    <Button 
      onClick={signInWithDiscord} 
      size="sm" 
      className={`gradient-primary text-white ${mobile ? 'w-full' : ''}`}
    >
      {!iconError ? (
        <Image
          src="/images/icons/discord.svg"
          alt=""
          width={18}
          height={18}
          className="mr-2"
          onError={handleIconError}
          unoptimized // This helps with SVG files
        />
      ) : (
        <DiscordIcon className="w-4 h-4 mr-2" />
      )}
      Login with Discord
    </Button>
  )

  return (
    <nav className="sticky top-0 z-50 bg-background-primary/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Text Only */}
          <Link href="/" className="flex items-center group">
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
                A-List Narcos
              </span>
              <span className="text-xs text-text-secondary -mt-1 group-hover:text-accent-light transition-colors">
                Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-accent-primary transition-colors duration-200 font-medium relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-purple group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <LoadingSpinner size="sm" color="primary" />
            ) : user ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 bg-background-secondary/50 hover:bg-background-secondary/80 rounded-lg px-3 py-2 transition-all duration-200 border border-white/10 hover:border-accent-primary/30 purple-glow-hover"
                >
                  <div className="relative">
                    {!avatarLoaded && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse" />
                    )}
                    <Image
                      src={avatarSrc}
                      alt={`${username}'s avatar`}
                      width={32}
                      height={32}
                      className={`rounded-full transition-opacity duration-200 ring-2 ring-accent-primary/30 ${
                        avatarLoaded ? 'opacity-100' : 'opacity-0 absolute'
                      }`}
                      onLoad={handleAvatarLoad}
                      onError={handleAvatarError}
                      priority
                    />
                  </div>
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">
                    {username}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                      isMenuOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-64 bg-background-secondary rounded-lg shadow-xl border border-white/10 py-2 z-50 purple-glow"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={avatarSrc}
                          alt={`${username}'s avatar`}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-accent-primary/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {username}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {hasAccess ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                Active Member
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                Pending Access
                              </span>
                            )}
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <hr className="my-1 border-white/10" />
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DiscordLoginButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-secondary hover:text-white p-2 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 bg-background-secondary/50 rounded-b-lg">
            <div className="flex flex-col space-y-4">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-secondary hover:text-accent-primary transition-colors duration-200 font-medium px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {loading ? (
                <div className="px-2 py-1">
                  <LoadingSpinner size="sm" color="primary" />
                </div>
              ) : user ? (
                <div className="flex flex-col space-y-2 px-2 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-3 py-2">
                    <Image
                      src={avatarSrc}
                      alt={`${username}'s avatar`}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-accent-primary/50"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {hasAccess ? (
                          <span className="text-xs text-green-400">Active Member</span>
                        ) : (
                          <span className="text-xs text-red-400">Pending Access</span>
                        )}
                        {isAdmin && (
                          <span className="text-xs text-accent-primary">Admin</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-red-400 hover:text-red-300 py-2 text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <DiscordLoginButton mobile />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}