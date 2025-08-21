"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getDiscordId,
  getUsername,
  isUserAdmin,
  getFromStorage,
  setToStorage,
  removeFromStorage,
} from "@/lib/utils";
import { withTimeout } from "@/lib/timeout";
import type { User, Session } from "@supabase/supabase-js";

// ====================================
// TYPES - Unchanged for compatibility
// ====================================

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

interface CachedAuthData {
  state: {
    userExists: boolean;
    sessionExists: boolean;
    hasAccess: boolean;
    isTrialActive: boolean;
    isAdmin: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
  };
  timestamp: number;
}

function isCachedAuthData(data: unknown): data is CachedAuthData {
  return (
    typeof data === "object" &&
    data !== null &&
    "timestamp" in data &&
    "state" in data &&
    typeof (data as any).timestamp === "number" &&
    typeof (data as any).state === "object"
  );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ====================================
// CONSTANTS - Optimized for performance
// ====================================

const AUTH_CACHE_KEY = "auth_cache";
const LOGIN_SESSION_KEY = "login_session_tracking"; // NEW: Track login sessions
const AUTH_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const LOGIN_SESSION_TTL = 30 * 60 * 1000; // 30 minutes for login tracking
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
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
  
  // ====================================
  // NEW: LOGIN TRACKING SYSTEM
  // ====================================
  
  // Track actual logins (OAuth callbacks) vs. page visits
  const loginSessionTracker = useRef(new Set<string>());
  const oauthCallbackProcessed = useRef(false);
  const currentSessionId = useRef<string | null>(null);
  
  // Cache admin checks to reduce database calls
  const adminCheckCacheRef = useRef(new Map<string, { result: boolean; timestamp: number }>());

  const supabase = createClient();

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================

  // Generate unique session ID for tracking
  const generateSessionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if login was already tracked in current session
  const isLoginTrackedInSession = useCallback((discordId: string) => {
    try {
      const cached = getFromStorage(LOGIN_SESSION_KEY);
      if (!cached || typeof cached !== 'object') return false;
      
      const sessionData = cached as { [key: string]: { timestamp: number; sessionId: string } };
      const userSession = sessionData[discordId];
      
      if (!userSession) return false;
      
      // Check if session is still valid (30 minutes)
      const isValid = Date.now() - userSession.timestamp < LOGIN_SESSION_TTL;
      const isSameSession = userSession.sessionId === currentSessionId.current;
      
      return isValid && isSameSession;
    } catch (error) {
      console.error('Error checking login tracking:', error);
      return false;
    }
  }, []);

  // Mark login as tracked in current session
  const markLoginTracked = useCallback((discordId: string) => {
    try {
      const sessionData = getFromStorage(LOGIN_SESSION_KEY) || {};
      sessionData[discordId] = {
        timestamp: Date.now(),
        sessionId: currentSessionId.current,
      };
      setToStorage(LOGIN_SESSION_KEY, sessionData);
      loginSessionTracker.current.add(discordId);
      console.log('✅ Login tracking marked for:', discordId);
    } catch (error) {
      console.error('Error marking login tracked:', error);
    }
  }, []);

  // Clean expired login tracking data
  const cleanupLoginTracking = useCallback(() => {
    try {
      const sessionData = getFromStorage(LOGIN_SESSION_KEY) || {};
      const now = Date.now();
      const cleaned = {};
      
      Object.entries(sessionData).forEach(([discordId, data]: [string, any]) => {
        if (data && typeof data === 'object' && now - data.timestamp < LOGIN_SESSION_TTL) {
          cleaned[discordId] = data;
        }
      });
      
      setToStorage(LOGIN_SESSION_KEY, cleaned);
    } catch (error) {
      console.error('Error cleaning login tracking:', error);
    }
  }, []);

// ====================================
// ADMIN STATUS CHECKING
// ====================================

const checkAdminStatusSecure = useCallback(
  async (user?: User): Promise<boolean> => {
    if (!user && !state.user) return false;
    const currentUser = user || state.user;
    if (!currentUser) return false;

    try {
      const { data, error } = await supabase.rpc("is_admin");

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Failed to check admin status:", error);
      return false;
    }
  },
  [state.user, supabase]
);

const checkAdminStatusFallback = useCallback(
  (user?: User): boolean => {
    const currentUser = user || state.user;
    if (!currentUser) return false;

    const discordId = getDiscordId(currentUser);
    if (!discordId) return false;

    const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(",") || [];
    return adminIds.includes(discordId);
  },
  [state.user]
);

const checkAdminStatus = useCallback(
  async (user?: User): Promise<boolean> => {
    const currentUser = user || state.user;
    if (!currentUser) return false;

    const discordId = getDiscordId(currentUser);
    if (!discordId) return false;

    // Check cache first (5 minute TTL)
    const cacheKey = `admin-${discordId}`;
    const cached = adminCheckCacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.result;
    }

    // PRIMARY: Use database function
    try {
      const { data, error } = await supabase.rpc("is_admin");

      if (error) {
        throw error;
      }

      const isAdmin = data === true;

      // Cache the successful result
      adminCheckCacheRef.current.set(cacheKey, {
        result: isAdmin,
        timestamp: Date.now(),
      });

      return isAdmin;
    } catch (error) {
      console.error("Database admin check failed, using fallback:", error);
      
      // FALLBACK: Use environment variables only if database fails
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_IDS?.split(",") || [];
      const fallbackResult = adminIds.includes(discordId);

      // Cache the fallback result (shorter TTL)
      adminCheckCacheRef.current.set(cacheKey, {
        result: fallbackResult,
        timestamp: Date.now() - (4 * 60 * 1000), // Expire in 1 minute instead of 5
      });

      return fallbackResult;
    }
  },
  [state.user, supabase]
);

// ====================================
// USER ACCESS CHECKING
// ====================================

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
      canManageUsers: false,
    };
  }

  try {
    // Check admin status using database function
    const isAdmin = await checkAdminStatus(user);

    // Get user access data (protected by RLS)
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

    const now = new Date();

    // Check if user is revoked (banned) - admins bypass this
    if (data.revoked && !isAdmin) {
      return {
        hasAccess: false,
        isTrialActive: false,
        isAdmin,
        canViewAnalytics: isAdmin,
        canManageUsers: isAdmin,
        userData: { ...data, hasAccess: false, isTrialActive: false },
      };
    }

    // Check trial status
    let isTrialActive = false;
    if (data.hub_trial && data.trial_expiration) {
      const trialExpiration = new Date(data.trial_expiration);
      isTrialActive = trialExpiration > now;

      // AUTO-REVOKE EXPIRED TRIALS (but not for admins)
      if (!isTrialActive && !isAdmin) {
        console.log("Trial expired, auto-revoking user:", discordId);

        startTransition(() => {
          supabase
            .from("users")
            .update({ revoked: true })
            .eq("discord_id", discordId)
            .then(
              () => console.log("Auto-revoked expired trial:", discordId),
              (revokeError) =>
                console.error("Failed to auto-revoke expired trial:", revokeError)
            );
        });

        return {
          hasAccess: false,
          isTrialActive: false,
          isAdmin,
          canViewAnalytics: isAdmin,
          canManageUsers: isAdmin,
          userData: {
            ...data,
            hasAccess: false,
            isTrialActive: false,
            revoked: true,
          },
        };
      }
    }

    // Access determination: Admins ALWAYS have access
    const hasAccess = isAdmin || (!data.revoked || isTrialActive);

    return {
      hasAccess,
      isTrialActive,
      isAdmin,
      canViewAnalytics: isAdmin || hasAccess,
      canManageUsers: isAdmin,
      userData: { ...data, hasAccess, isTrialActive },
    };
  } catch (error) {
    console.error("Error checking user access:", error);
    setError(
      error instanceof Error
        ? error
        : new Error("Failed to check user access")
    );

    // Emergency fallback using environment variables
    const fallbackAdmin = checkAdminStatusFallback(user);
    
    return {
      hasAccess: fallbackAdmin,
      isTrialActive: false,
      isAdmin: fallbackAdmin,
      canViewAnalytics: fallbackAdmin,
      canManageUsers: fallbackAdmin,
    };
  }
};

  // ====================================
  // FIXED: USER RECORD MANAGEMENT
  // ====================================

  // NEW: Separate function to ensure user record exists (without tracking login)
  const ensureUserRecordExists = useCallback(
    async (user: User): Promise<void> => {
      try {
        const discordId = getDiscordId(user);
        const username = getUsername(user);

        if (!discordId) return;

        // Check if user record exists first
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("discord_id", discordId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking user existence:", fetchError);
          return;
        }

        // If user doesn't exist, create record (but don't increment login_count)
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              discord_id: discordId,
              username: username,
              revoked: false,
              login_count: 0, // Start at 0, will be incremented only on actual login
              hub_trial: false,
            });

          if (insertError) {
            console.error("Error creating user record:", insertError);
          } else {
            console.log("✅ User record created for:", discordId);
          }
        }
      } catch (error) {
        console.error("Error ensuring user record exists:", error);
      }
    },
    [supabase]
  );

  // NEW: Track actual login (only called on OAuth success)
  const trackUserLogin = useCallback(
    async (user: User): Promise<void> => {
      try {
        const discordId = getDiscordId(user);
        const username = getUsername(user);

        if (!discordId) return;

        // Check if already tracked in this session
        if (isLoginTrackedInSession(discordId)) {
          console.log("⏭️ Login already tracked this session:", discordId);
          return;
        }

        // Call the database function to increment login count
        const { error } = await supabase.rpc("upsert_user_login", {
          target_discord_id: discordId,
          user_name: username,
        });

        if (error) {
          console.error("Error tracking user login:", error);
          return;
        }

        // Mark as tracked in current session
        markLoginTracked(discordId);
        console.log("✅ Login count incremented for:", discordId);
      } catch (error) {
        console.error("Error tracking user login:", error);
      }
    },
    [supabase, isLoginTrackedInSession, markLoginTracked]
  );

  // ====================================
  // CACHE MANAGEMENT
  // ====================================

  const sanitizeDataForCache = (data: any) => {
    const { session, ...safeData } = data;
    return {
      ...safeData,
      sessionExists: !!session,
      userExists: !!data.user,
    };
  };

  const getSessionHealth = useCallback(() => {
    const isHealthy = !!(state.session && state.user && !error);
    return {
      isHealthy,
      lastCheck: lastHealthCheck,
    };
  }, [state.session, state.user, error, lastHealthCheck]);

  const invalidateCache = useCallback(() => {
    try {
      removeFromStorage(AUTH_CACHE_KEY);
      removeFromStorage(LOGIN_SESSION_KEY);
      removeFromStorage("profile_data_cache");
      removeFromStorage("blueprints_cache");

      const sensitiveKeys = ["auth_", "session_", "user_"];
      if (typeof localStorage !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (sensitiveKeys.some((prefix) => key.startsWith(prefix))) {
            removeFromStorage(key);
          }
        });
      }

      setHasValidCache(false);
      setLastUpdated(null);
      
      // Clear tracking refs
      loginSessionTracker.current.clear();
      adminCheckCacheRef.current.clear();
    } catch (error) {
      console.error("Error invalidating cache:", error);
    }
  }, []);

  // ====================================
  // LOAD CACHED AUTH DATA
  // ====================================

  useEffect(() => {
    try {
      const cached = getFromStorage(AUTH_CACHE_KEY);

      if (cached && isCachedAuthData(cached)) {
        const isExpired = Date.now() - cached.timestamp > AUTH_CACHE_TTL;

        if (
          !isExpired &&
          cached.state?.userExists &&
          typeof cached.state.hasAccess === "boolean"
        ) {
          console.log("📋 Using cached auth data");

          const cachedState = {
            user: cached.state.userExists ? ({ id: "cached" } as User) : null,
            session: cached.state.sessionExists
              ? ({ expires_at: 0 } as Session)
              : null,
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
          invalidateCache();
        }
      }
      
      // Initialize session ID
      if (!currentSessionId.current) {
        currentSessionId.current = generateSessionId();
      }
      
      // Cleanup expired login tracking
      cleanupLoginTracking();
    } catch (error) {
      console.error("Error loading cached auth data:", error);
      invalidateCache();
    } finally {
      if (!hasValidCache) {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  // ====================================
  // FIXED: REFRESH USER DATA
  // ====================================

  const refreshUserDataInternal = async (session: Session | null = null) => {
    if (!session && !state.session?.user) return;

    const currentUser = session?.user || state.session?.user;
    if (!currentUser) return;

    setIsRefreshing(true);
    setError(null);

    try {
      // FIXED: Only ensure user record exists, don't track login
      await ensureUserRecordExists(currentUser);

      const {
        hasAccess,
        isTrialActive,
        isAdmin,
        canViewAnalytics,
        canManageUsers,
      } = await checkUserAccess(currentUser as User);

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

  // ====================================
  // AUTH ACTIONS
  // ====================================

  const signInWithDiscord = async () => {
  try {
    setError(null);
    
    // Step 1: Get Supabase to generate the OAuth URL with proper state
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "identify",
      },
    });
    
    if (error) throw error;
    
    // Step 2: Intercept and modify the URL before redirect
    if (data?.url) {
      const originalUrl = new URL(data.url);
      
      // Force scope to be identify only (override any other scopes)
      originalUrl.searchParams.set('scope', 'identify');
      
      // Redirect with the modified URL
      window.location.href = originalUrl.toString();
    }
    
  } catch (error) {
    console.error("Error signing in with Discord:", error);
    setError(
      error instanceof Error
        ? error
        : new Error("Failed to sign in with Discord")
    );
  }
};

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await withTimeout(supabase.auth.signOut(), 10000);
      if (error) throw error;

      // Clear all tracking and cache
      invalidateCache();
      oauthCallbackProcessed.current = false;
      currentSessionId.current = null;

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

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }

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

  // ====================================
  // SESSION MANAGEMENT
  // ====================================

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
        const {
          hasAccess,
          isTrialActive,
          isAdmin,
          canViewAnalytics,
          canManageUsers,
        } = await checkUserAccess(session.user as User);

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
      setError(
        error instanceof Error ? error : new Error("Failed to get session")
      );

      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        setTimeout(getSession, RETRY_DELAY * retryAttemptsRef.current);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  // ====================================
  // HEALTH CHECK
  // ====================================

  const performHealthCheck = useCallback(async () => {
    if (isRefreshing || !state.user) return;

    try {
      const {
        data: { session },
        error,
      } = await withTimeout(supabase.auth.getSession(), 5000);

      setLastHealthCheck(Date.now());

      if (error || !session) {
        console.warn("Health check failed - session invalid");
        await signOut();
      }
    } catch (error) {
      console.warn("Health check failed:", error);
    }
  }, [isRefreshing, state.user, supabase]);

  // ====================================
  // FIXED: AUTH STATE CHANGE HANDLING
  // ====================================

  useEffect(() => {
    if (!hasValidCache) {
      getSession();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      if (event === "INITIAL_SESSION" && session?.user) {
        const isSuccessfulAuth = window.location.search.includes("?auth=success");

        // FIXED: Only process OAuth callback once and only track login on actual OAuth success
        if (isSuccessfulAuth && !oauthCallbackProcessed.current) {
          oauthCallbackProcessed.current = true;
          
          const discordId = getDiscordId(session.user);
          if (discordId) {
            console.log("🎯 Processing OAuth callback for:", discordId);
            
            // Track the actual login (increment login_count)
            await trackUserLogin(session.user as User);
            
            // Clean up URL
            router.replace(window.location.pathname);
          }
        }

        // Process user access (this doesn't track login, just checks permissions)
        const {
          hasAccess,
          isTrialActive,
          isAdmin,
          canViewAnalytics,
          canManageUsers,
        } = await checkUserAccess(session.user as User);

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
        // Clear all tracking on sign out
        invalidateCache();
        oauthCallbackProcessed.current = false;
        currentSessionId.current = null;
        
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
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          // FIXED: Don't track login on token refresh, just refresh user data
          setTimeout(() => {
            refreshUserDataInternal(session);
          }, 1000);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (healthCheckIntervalRef.current)
        clearInterval(healthCheckIntervalRef.current);
    };
  }, [hasValidCache]);

  // ====================================
  // BACKGROUND INTERVALS
  // ====================================

  useEffect(() => {
    if (state.user && !isRefreshing) {
      refreshIntervalRef.current = setInterval(() => {
        refreshUserDataInternal();
      }, REFRESH_INTERVAL);

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

  // ====================================
  // REAL-TIME SUBSCRIPTION
  // ====================================

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
          console.log("👤 User access changed, refreshing data");
          await refreshUserDataInternal();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user]);

  // ====================================
  // CONTEXT VALUE
  // ====================================

  const contextValue: AuthContextType = {
    ...state,
    signInWithDiscord,
    signOut,
    refreshUserData,
    error,
    isRefreshing,
    lastUpdated,
    checkAdminStatus: () => state.isAdmin,
    invalidateCache,
    getSessionHealth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}