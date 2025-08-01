"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  getDiscordId, 
  getUsername, 
  isUserAdmin, 
  getFromStorage, 
  setToStorage, 
  removeFromStorage 
} from "@/lib/utils";
import { withTimeout } from "@/lib/timeout";
import type { User, Session } from "@supabase/supabase-js";

// Types for enhanced security
interface UserWithAccess {
  id: string;
  discord_id: string;
  username: string | null;
  created_at: string;
  revoked: boolean;
  last_login: string | null;
  login_count: number;
  hub_trial: boolean;
  trial_expiration: string | null;
  hasAccess: boolean;
  isTrialActive: boolean;
}

interface ExtendedAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasAccess: boolean;
  isTrialActive: boolean;
  isAdmin: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

interface AuthContextType extends ExtendedAuthState {
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  error: Error | null;
  isRefreshing: boolean;
  lastUpdated: number | null;
  checkAdminStatus: () => boolean;
  invalidateCache: () => void;
  getSessionHealth: () => { isHealthy: boolean; lastCheck: number | null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// SECURITY ENHANCEMENT: Reduced cache TTL for better security
const AUTH_CACHE_KEY = "auth_cache";
const AUTH_CACHE_TTL = 2 * 60 * 1000; // REDUCED: 2 minutes instead of 5
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for frequent refresh
const HEALTH_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const [state, setState] = useState<ExtendedAuthState>({
    user: null,
    session: null,
    loading: true,
    hasAccess: false,
    isTrialActive: false,
    isAdmin: false,
    canViewAnalytics: false,
    canManageUsers: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasValidCache, setHasValidCache] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<number | null>(null);

  const retryAttemptsRef = useRef(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  // SECURITY ENHANCEMENT: Server-side admin checking via RLS
  const checkAdminStatusSecure = useCallback(async (user?: User): Promise<boolean> => {
    if (!user && !state.user) return false;
    const currentUser = user || state.user;
    if (!currentUser) return false;
    
    try {
      // Use your RLS-protected is_admin() function
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  }, [state.user, supabase]);

  // SECURITY ENHANCEMENT: Client-side fallback (UI only, never trusted)
  const checkAdminStatusFallback = useCallback((user?: User): boolean => {
    // This is ONLY for UI purposes when server call fails
    // NEVER rely on this for actual security decisions
    const currentUser = user || state.user;
    if (!currentUser) return false;
    
    return isUserAdmin(currentUser);
  }, [state.user]);

  // Combined admin checking with server-first approach
  const checkAdminStatus = useCallback(async (user?: User): Promise<boolean> => {
    try {
      // Always try server-side check first (secure)
      return await checkAdminStatusSecure(user);
    } catch (error) {
      console.warn('Server admin check failed, using fallback:', error);
      // Fallback to client-side check (UI only)
      return checkAdminStatusFallback(user);
    }
  }, [checkAdminStatusSecure, checkAdminStatusFallback]);

  // SECURITY ENHANCEMENT: Enhanced user access checking with server-side admin verification
  const checkUserAccess = async (
    user: User,
    attempt = 1
  ): Promise<{ 
    hasAccess: boolean; 
    isTrialActive: boolean; 
    isAdmin: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    userData?: UserWithAccess;
  }> => {
    const discordId = getDiscordId(user);
    if (!discordId) {
      return { 
        hasAccess: false, 
        isTrialActive: false, 
        isAdmin: false,
        canViewAnalytics: false,
        canManageUsers: false
      };
    }

    try {
      // SECURITY: Use server-side admin checking
      const isAdmin = await checkAdminStatus(user);

      // Get user access data (protected by RLS) - execute query directly
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("discord_id", discordId)
        .single();

      if (error) {
        if (attempt < MAX_RETRY_ATTEMPTS) {
          console.warn(`Retry attempt ${attempt} for user access check`);
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAY * attempt)
          );
          return checkUserAccess(user, attempt + 1);
        }
        throw error;
      }

      // Check if revoked
      if (data.revoked) {
        return { 
          hasAccess: false, 
          isTrialActive: false, 
          isAdmin,
          canViewAnalytics: isAdmin,
          canManageUsers: isAdmin,
          userData: { ...data, hasAccess: false, isTrialActive: false }
        };
      }

      // Check trial status
      const now = new Date();
      const isTrialActive = data.hub_trial && 
        data.trial_expiration && 
        new Date(data.trial_expiration) > now;

      const hasAccess = !data.revoked && (isTrialActive || isAdmin);

      return { 
        hasAccess, 
        isTrialActive, 
        isAdmin,
        canViewAnalytics: isAdmin || hasAccess,
        canManageUsers: isAdmin,
        userData: { ...data, hasAccess, isTrialActive }
      };
    } catch (error) {
      console.error("Error checking user access:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to check user access")
      );
      
      // Even with errors, try to preserve admin status securely
      const fallbackAdmin = checkAdminStatusFallback(user);
      return { 
        hasAccess: false, 
        isTrialActive: false, 
        isAdmin: fallbackAdmin,
        canViewAnalytics: fallbackAdmin,
        canManageUsers: fallbackAdmin
      };
    }
  };

  // SECURITY ENHANCEMENT: Secure cache with data sanitization
  const sanitizeDataForCache = (data: any) => {
    // Remove sensitive session data before caching
    const { session, ...safeData } = data;
    return {
      ...safeData,
      // Only cache the minimum needed for UI
      sessionExists: !!session,
      userExists: !!data.user,
    };
  };

  const getSessionHealth = useCallback(() => {
    const isHealthy = !!(state.session && state.user && !error);
    return {
      isHealthy,
      lastCheck: lastHealthCheck
    };
  }, [state.session, state.user, error, lastHealthCheck]);

  // SECURITY ENHANCEMENT: Secure cache invalidation
  const invalidateCache = useCallback(() => {
    try {
      removeFromStorage(AUTH_CACHE_KEY);
      removeFromStorage("profile_data_cache");
      removeFromStorage("blueprints_cache");
      
      // Clear any other sensitive data
      const sensitiveKeys = ['auth_', 'session_', 'user_'];
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (sensitiveKeys.some(prefix => key.startsWith(prefix))) {
            removeFromStorage(key);
          }
        });
      }
      
      setHasValidCache(false);
      setLastUpdated(null);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }, []);

  // SECURITY ENHANCEMENT: Secure cache loading with validation
  useEffect(() => {
    try {
      const cached = getFromStorage(AUTH_CACHE_KEY);

      if (cached && cached.timestamp) {
        const isExpired = Date.now() - cached.timestamp > AUTH_CACHE_TTL;
        
        // SECURITY: Validate cached data structure
        if (!isExpired && cached.state?.userExists && typeof cached.state.hasAccess === 'boolean') {
          console.log("Using cached auth data");
          
          // Reconstruct minimal state from cache
          const cachedState = {
            user: cached.state.userExists ? { id: 'cached' } : null, // Minimal user object
            session: cached.state.sessionExists ? { expires_at: 0 } : null, // Minimal session
            loading: false,
            hasAccess: cached.state.hasAccess,
            isTrialActive: cached.state.isTrialActive || false,
            isAdmin: cached.state.isAdmin || false,
            canViewAnalytics: cached.state.canViewAnalytics || false,
            canManageUsers: cached.state.canManageUsers || false,
          };

          setState(cachedState as ExtendedAuthState);
          setLastUpdated(cached.timestamp);
          setHasValidCache(true);

          // Always refresh in background for security
          refreshUserDataInternal();
        } else {
          // Invalid or expired cache
          invalidateCache();
        }
      }
    } catch (error) {
      console.error("Error loading cached auth data:", error);
      invalidateCache(); // Clear potentially corrupted cache
    } finally {
      if (!hasValidCache) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  // Upsert user login
  const upsertUserLogin = useCallback(async (user: User) => {
    try {
      const discordId = getDiscordId(user);
      const username = getUsername(user);
      
      if (!discordId) return;

      await supabase.rpc("upsert_user_login", {
        target_discord_id: discordId,
        user_name: username,
      });
    } catch (error) {
      console.error("Error upserting user login:", error);
    }
  }, [supabase]);

  // SECURITY ENHANCEMENT: Enhanced refresh with server-side validation
  const refreshUserDataInternal = async (session: Session | null = null) => {
    if (!session && !state.session?.user) return;

    const currentUser = session?.user || state.session?.user;
    if (!currentUser) return;

    setIsRefreshing(true);
    setError(null);

    try {
      // Upsert user login
      await upsertUserLogin(currentUser);

      const { hasAccess, isTrialActive, isAdmin, canViewAnalytics, canManageUsers } = 
        await checkUserAccess(currentUser as User);

      const newState = {
        user: currentUser as User,
        session: session || state.session,
        loading: false,
        hasAccess,
        isTrialActive,
        isAdmin,
        canViewAnalytics,
        canManageUsers,
      };

      setState(newState);
      setLastUpdated(Date.now());
      setLastHealthCheck(Date.now());

      // SECURITY: Cache only sanitized data
      const sanitizedData = sanitizeDataForCache(newState);
      setToStorage(AUTH_CACHE_KEY, {
        state: sanitizedData,
        timestamp: Date.now(),
      });
      setHasValidCache(true);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to refresh user data")
      );
    } finally {
      setIsRefreshing(false);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const refreshUserData = async () => {
    await refreshUserDataInternal();
  };

  // SECURITY ENHANCEMENT: Enhanced sign-in with security headers
  const signInWithDiscord = async () => {
    try {
      setError(null);
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "discord",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'identify', // Minimal scopes for security
          },
        }),
        15000 // 15 second timeout for OAuth
      );
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Discord:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to sign in with Discord")
      );
    }
  };

  // SECURITY ENHANCEMENT: Comprehensive secure sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await withTimeout(supabase.auth.signOut(), 10000);
      if (error) throw error;

      // Complete security cleanup
      invalidateCache();

      setState({
        user: null,
        session: null,
        loading: false,
        hasAccess: false,
        isTrialActive: false,
        isAdmin: false,
        canViewAnalytics: false,
        canManageUsers: false,
      });

      setLastUpdated(null);
      setLastHealthCheck(null);

      // Clear intervals
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }

      // Force page reload for complete cleanup
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to sign out")
      );
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Enhanced getSession with security validation
  const getSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      setError(null);

      const {
        data: { session },
        error,
      } = await withTimeout(supabase.auth.getSession(), 10000);

      if (error) throw error;

      if (session?.user) {
        const { hasAccess, isTrialActive, isAdmin, canViewAnalytics, canManageUsers } = 
          await checkUserAccess(session.user as User);

        const newState = {
          user: session.user as User,
          session: session as Session,
          loading: false,
          hasAccess,
          isTrialActive,
          isAdmin,
          canViewAnalytics,
          canManageUsers,
        };

        setState(newState);
        setLastUpdated(Date.now());
        setLastHealthCheck(Date.now());

        // Cache sanitized data
        const sanitizedData = sanitizeDataForCache(newState);
        setToStorage(AUTH_CACHE_KEY, {
          state: sanitizedData,
          timestamp: Date.now(),
        });
        setHasValidCache(true);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error in getSession:", error);
      setState((prev) => ({ ...prev, loading: false }));
      setError(error instanceof Error ? error : new Error("Failed to get session"));

      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        setTimeout(getSession, RETRY_DELAY * retryAttemptsRef.current);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  // Health check with enhanced security
  const performHealthCheck = useCallback(async () => {
    if (isRefreshing || !state.user) return;

    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        5000
      );

      setLastHealthCheck(Date.now());

      if (error || !session) {
        console.warn('Health check failed - session invalid');
        await signOut();
      }
    } catch (error) {
      console.warn('Health check failed:', error);
    }
  }, [isRefreshing, state.user, supabase]);

  // Initialize auth state
  useEffect(() => {
    if (!hasValidCache) {
      getSession();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === "INITIAL_SESSION" && session?.user) {
        const isSuccessfulAuth = window.location.search.includes("?auth=success");

        if (isSuccessfulAuth) {
          const discordId = getDiscordId(session.user);
          const username = getUsername(session.user);

          if (discordId) {
            try {
              await supabase.rpc("upsert_user_login", {
                target_discord_id: discordId,
                user_name: username,
              });
            } catch (error) {
              console.error("Failed to track user login:", error);
            }

            router.replace(window.location.pathname);
          }
        }

        const { hasAccess, isTrialActive, isAdmin, canViewAnalytics, canManageUsers } = 
          await checkUserAccess(session.user as User);

        const newState = {
          user: session.user as User,
          session: session as Session,
          loading: false,
          hasAccess,
          isTrialActive,
          isAdmin,
          canViewAnalytics,
          canManageUsers,
        };

        setState(newState);

        const authStateChanged =
          !state.session?.user?.id ||
          state.session.user.id !== session.user.id ||
          state.hasAccess !== hasAccess ||
          state.isTrialActive !== isTrialActive ||
          state.isAdmin !== isAdmin;

        if (authStateChanged) {
          setLastUpdated(Date.now());
          setLastHealthCheck(Date.now());

          const sanitizedData = sanitizeDataForCache(newState);
          setToStorage(AUTH_CACHE_KEY, {
            state: sanitizedData,
            timestamp: Date.now(),
          });
          setHasValidCache(true);
        }
      } else if (event === "SIGNED_OUT") {
        invalidateCache();
        setState({
          user: null,
          session: null,
          loading: false,
          hasAccess: false,
          isTrialActive: false,
          isAdmin: false,
          canViewAnalytics: false,
          canManageUsers: false,
        });
        setLastUpdated(null);
        setLastHealthCheck(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Delay to ensure session is fully established
          setTimeout(() => {
            refreshUserDataInternal(session);
          }, 1000);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current);
    };
  }, [hasValidCache]);

  // Security-conscious health monitoring
  useEffect(() => {
    if (state.user && !isRefreshing) {
      // Set up periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshUserDataInternal();
      }, REFRESH_INTERVAL);

      // Set up health check
      healthCheckIntervalRef.current = setInterval(() => {
        performHealthCheck();
      }, HEALTH_CHECK_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [state.user, isRefreshing]);

  // Real-time subscription with enhanced security
  useEffect(() => {
    if (!state.user) return;

    const discordId = getDiscordId(state.user);
    if (!discordId) return;

    const channel = supabase
      .channel("user-access-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `discord_id=eq.${discordId}`,
        },
        async (payload) => {
          console.log("User access changed, refreshing data");
          await refreshUserDataInternal();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user]);

  const contextValue: AuthContextType = {
    ...state,
    signInWithDiscord,
    signOut,
    refreshUserData,
    error,
    isRefreshing,
    lastUpdated,
    checkAdminStatus: () => state.isAdmin, // Return cached status for sync calls
    invalidateCache,
    getSessionHealth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}