"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getDiscordId } from "@/lib/utils";

interface User {
  discord_id: string;
  username: string | null;
}

interface ReferralSelectorProps {
  value: string;
  onChange: (value: string, discordId?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ReferralSelector({
  value,
  onChange,
  disabled = false,
  className = "",
}: ReferralSelectorProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedDiscordId, setSelectedDiscordId] = useState<string>("");
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const supabase = createClient();

  // Get current user's Discord ID to exclude from results
  const currentUserDiscordId = user ? getDiscordId(user) : null;

  // Debounced search function
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    console.log("🔍 Starting search for:", query.trim());
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 10000);
      });

      // Build the query
      let queryBuilder = supabase
        .from("users")
        .select("discord_id, username")
        .not("username", "is", null)
        .neq("username", "")
        .order("username", { ascending: true })
        .limit(20);

      // Exclude current user from results
      if (currentUserDiscordId) {
        queryBuilder = queryBuilder.neq("discord_id", currentUserDiscordId);
      }

      // Search both username and case-insensitive partial matches
      queryBuilder = queryBuilder.or(`username.ilike.%${query.trim()}%,username.ilike.%${query.trim().toLowerCase()}%,username.ilike.%${query.trim().toUpperCase()}%`);

      console.log("🔍 Executing query...");
      
      // Race the query against timeout
      const result = await Promise.race([
        queryBuilder,
        timeoutPromise
      ]) as { data: User[] | null; error: any };

      console.log("🔍 Query result:", result);

      if (result.error) {
        console.error("❌ Error searching users:", result.error);
        
        // Check if it's an RLS policy error
        if (result.error.code === '42501' || result.error.message?.includes('policy')) {
          console.error("❌ RLS Policy Error - User doesn't have permission to search users table");
          console.error("❌ You may need to update your RLS policies to allow searching");
        }
        
        setSuggestions([]);
        return;
      }

      // Filter results to ensure quality
      const filteredData = (result.data || []).filter(
        (userData) => {
          const isCurrentUser = userData.discord_id === currentUserDiscordId;
          const hasUsername = userData.username && userData.username.trim() !== "";
          const matchesSearch = userData.username?.toLowerCase().includes(query.toLowerCase());
          return !isCurrentUser && hasUsername && matchesSearch;
        }
      );

      console.log("🔍 Filtered results:", filteredData.length, "users found");
      setSuggestions(filteredData);
      
    } catch (error) {
      console.error("❌ Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, currentUserDiscordId]);

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchTerm(newValue);
      setSelectedIndex(-1);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // If input is cleared, reset everything
      if (!newValue.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        setSelectedDiscordId("");
        setIsValidSelection(false);
        setHasSearched(false);
        onChange("", "");
        return;
      }

      // If user is typing after having selected someone, clear the selection
      if (selectedDiscordId || isValidSelection) {
        setSelectedDiscordId("");
        setIsValidSelection(false);
      }

      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(newValue);
        setIsOpen(true);
      }, 500); // Slightly longer delay to reduce API calls

      // Update parent with current text value (clear Discord ID since they're typing)
      onChange(newValue, "");
    },
    [searchUsers, onChange, selectedDiscordId, isValidSelection]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (userData: User) => {
      const username = userData.username || `User ${userData.discord_id}`;
      setSearchTerm(username);
      setSelectedDiscordId(userData.discord_id);
      setIsValidSelection(true);
      setIsOpen(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      setHasSearched(false);
      
      // Clear any pending search timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      onChange(username, userData.discord_id);

      // Focus back to input for accessibility
      inputRef.current?.focus();
    },
    [onChange]
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 && !isValidSelection) {
      setIsOpen(true);
    }
  }, [suggestions.length, isValidSelection]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === "ArrowDown" && suggestions.length === 0 && searchTerm.trim().length >= 2) {
          searchUsers(searchTerm);
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;

        case "Tab":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSuggestionSelect, searchTerm, searchUsers]
  );

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder="Type to search Discord usernames..."
        disabled={disabled}
        className="w-full p-4 sm:p-5 rounded-xl border-2 border-purple-500/20 bg-black/40 text-white text-base sm:text-lg backdrop-blur-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 placeholder-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-describedby="referral-help"
        role="combobox"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-400" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && !isValidSelection && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-black/90 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((userData, index) => (
            <div
              key={userData.discord_id}
              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-purple-500/10 last:border-b-0 ${
                index === selectedIndex
                  ? "bg-purple-400/20 text-purple-300"
                  : "text-white/90 hover:bg-white/5"
              }`}
              onClick={() => handleSuggestionSelect(userData)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userData.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-medium">
                    {userData.username || `User ${userData.discord_id.slice(0, 8)}...`}
                  </div>
                  <div className="text-xs text-white/60">
                    Discord ID: {userData.discord_id.slice(0, 12)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Valid selection confirmation */}
      {isValidSelection && selectedDiscordId && (
        <div className="w-full mt-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 backdrop-blur-xl rounded-xl shadow-2xl p-4">
          <div className="flex items-center gap-3 text-green-300">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-medium">✅ Discord username found in A-List users database</div>
              <div className="text-xs text-green-300/80 mt-1">Referral tracking will be applied</div>
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && hasSearched && searchTerm.length >= 2 && suggestions.length === 0 && !isValidSelection && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-black/90 backdrop-blur-xl border border-red-500/20 rounded-xl shadow-2xl p-4 text-center"
        >
          <div className="text-red-400 font-medium mb-1">
            No users found matching "{searchTerm}"
          </div>
          <div className="text-white/60 text-sm">
            Make sure the Discord username is exact and the user has registered on A-List Hub
          </div>
        </div>
      )}

      {/* Help text */}
      <div id="referral-help" className="mt-2 text-white/60 text-sm">
        {isValidSelection ? (
          "✅ Valid referral selected - tracking will be applied"
        ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
          "Type at least 2 characters to search Discord usernames"
        ) : isLoading ? (
          "🔍 Searching A-List users database..."
        ) : (
          "Start typing a Discord username to search registered A-List users"
        )}
      </div>
    </div>
  );
}