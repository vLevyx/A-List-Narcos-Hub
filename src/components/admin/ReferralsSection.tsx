// components/admin/ReferralsSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { withTimeout } from "@/lib/timeout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Search, UserPlus, Trophy, Target, TrendingUp } from "lucide-react";

interface ReferralRecord {
  id: string;
  referred_player_discord_id: string;
  referrer_discord_id: string;
  referrer_username: string;
  referred_player_username: string;
  trial_start_date: string;
  premium_date: string | null;
  status: 'Trial' | 'Premium';
  days_since_trial: number;
}

interface ReferrerStats {
  discord_id: string;
  username: string;
  total_referrals: number;
  premium_conversions: number;
  active_trials: number;
  conversion_rate: number;
}

interface StatData {
  total_referrals: number;
  premium_conversions: number;
  active_trials: number;
  conversion_rate: number;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export function ReferralsSection() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [referrerStats, setReferrerStats] = useState<ReferrerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'referrals' | 'stats'>('referrals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Trial' | 'Premium'>('all');

  const supabase = createClient();

  // Load all referral records
  const loadReferrals = useCallback(async () => {
    try {
      setLoading(true);
      
      const rpcCall = async (): Promise<SupabaseResponse<ReferralRecord[]>> => {
        return await supabase.rpc('get_all_referrals');
      };
      
      const result = await withTimeout(rpcCall(), 10000);
      
      if (result.error) {
        console.error('Error loading referrals:', result.error);
        return;
      }

      setReferrals(result.data || []);
    } catch (error) {
      console.error('Failed to load referrals:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load referrer statistics
  const loadReferrerStats = useCallback(async () => {
    try {
      if (!referrals || referrals.length === 0) {
        setReferrerStats([]);
        return;
      }

      // Extract unique referrers from loaded referrals data
      const uniqueReferrerMap = new Map();
      referrals.forEach(ref => {
        uniqueReferrerMap.set(ref.referrer_discord_id, {
          referrer_discord_id: ref.referrer_discord_id,
          referrer_username: ref.referrer_username
        });
      });

      const stats: ReferrerStats[] = [];
      const referrerEntries = Array.from(uniqueReferrerMap.entries());
      
      for (const [discordId, referrerInfo] of referrerEntries) {
        try {
          const rpcCall = async (): Promise<SupabaseResponse<StatData[]>> => {
            return await supabase.rpc('get_referrer_stats', { p_referrer_discord_id: discordId });
          };
          
          const result = await withTimeout(rpcCall(), 10000);

          if (result.error) {
            console.error(`Error getting stats for ${discordId}:`, result.error);
            continue;
          }

          if (result.data) {
            let stat: StatData | null = null;
            
            if (Array.isArray(result.data) && result.data.length > 0) {
              stat = result.data[0] as StatData;
            } else if (!Array.isArray(result.data)) {
              stat = result.data as StatData;
            }
            
            if (stat) {
              stats.push({
                discord_id: discordId,
                username: referrerInfo.referrer_username,
                total_referrals: stat.total_referrals || 0,
                premium_conversions: stat.premium_conversions || 0,
                active_trials: stat.active_trials || 0,
                conversion_rate: stat.conversion_rate || 0
              });
            }
          }
        } catch (error) {
          console.error(`Error getting stats for ${discordId}:`, error);
        }
      }

      // Sort by total referrals descending
      stats.sort((a, b) => b.total_referrals - a.total_referrals);
      setReferrerStats(stats);

    } catch (error) {
      console.error('Failed to load referrer stats:', error);
    }
  }, [supabase, referrals]);

  // Initial load
  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  // Load stats when referrals are available
  useEffect(() => {
    if (referrals.length > 0) {
      loadReferrerStats();
    }
  }, [referrals, loadReferrerStats]);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('referrals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        () => {
          loadReferrals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadReferrals, supabase]);

  // Filter referrals based on search and status
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = !searchTerm || 
      referral.referred_player_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referrer_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referred_player_discord_id.includes(searchTerm) ||
      referral.referrer_discord_id.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string, daysSinceTrial: number) => {
    if (status === 'Premium') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Premium
        </span>
      );
    }

    // Trial status with urgency based on days
    let badgeClass = "bg-blue-500/20 text-blue-400";
    if (daysSinceTrial > 7) {
      badgeClass = "bg-red-500/20 text-red-400";
    } else if (daysSinceTrial > 5) {
      badgeClass = "bg-yellow-500/20 text-yellow-400";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        Trial ({daysSinceTrial}d)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-white/60">Loading referrals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-white">Referral Management</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-background-secondary/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'referrals'
                  ? 'bg-accent-primary text-black'
                  : 'text-white/70 hover:text-white hover:bg-background-secondary/50'
              }`}
            >
              Referrals ({referrals.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-accent-primary text-black'
                  : 'text-white/70 hover:text-white hover:bg-background-secondary/50'
              }`}
            >
              Statistics ({referrerStats.length})
            </button>
          </div>
          
          <Button
            onClick={loadReferrals}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by username or Discord ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background-primary border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-primary"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Trial' | 'Premium')}
              className="px-4 py-2.5 bg-background-primary border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Status</option>
              <option value="Trial">Trial</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          {/* Referrals Table */}
          <div className="bg-background-secondary/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary/50">
                  <tr>
                    <th className="p-4 text-left text-accent-primary font-medium">Referred Player</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Referrer</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Status</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Trial Start</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Premium Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/60">
                        {referrals.length === 0 ? 'No referrals found' : 'No referrals match your filters'}
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-background-primary/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">
                              {referral.referred_player_username}
                            </p>
                            <p className="text-sm text-white/60">
                              {referral.referred_player_discord_id}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">
                              {referral.referrer_username}
                            </p>
                            <p className="text-sm text-white/60">
                              {referral.referrer_discord_id}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(referral.status, referral.days_since_trial)}
                        </td>
                        <td className="p-4">
                          <p className="text-white/80">
                            {formatDate(referral.trial_start_date)}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-white/80">
                            {formatDate(referral.premium_date)}
                          </p>
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

      {/* Referrer Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background-secondary/50 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Referrals</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {referrerStats.reduce((sum, stat) => sum + stat.total_referrals, 0)}
                  </p>
                </div>
                <UserPlus className="w-8 h-8 text-accent-primary" />
              </div>
            </div>
            
            <div className="bg-background-secondary/50 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Premium Conversions</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {referrerStats.reduce((sum, stat) => sum + stat.premium_conversions, 0)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-background-secondary/50 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Active Trials</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">
                    {referrerStats.reduce((sum, stat) => sum + stat.active_trials, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Referrer Stats Table */}
          <div className="bg-background-secondary/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-primary/50">
                  <tr>
                    <th className="p-4 text-left text-accent-primary font-medium">Referrer</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Total Referrals</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Premium Conversions</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Active Trials</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Conversion Rate</th>
                    <th className="p-4 text-left text-accent-primary font-medium">Potential Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrerStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/60">
                        No referrer statistics available
                      </td>
                    </tr>
                  ) : (
                    referrerStats.map((stat) => (
                      <tr key={stat.discord_id} className="hover:bg-background-primary/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">
                              {stat.username}
                            </p>
                            <p className="text-sm text-white/60">
                              {stat.discord_id}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-lg font-bold text-accent-primary">
                            {stat.total_referrals}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-lg font-bold text-green-400">
                            {stat.premium_conversions}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-lg font-bold text-blue-400">
                            {stat.active_trials}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">
                              {stat.conversion_rate}%
                            </p>
                            <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[60px]">
                              <div
                                className="bg-gradient-to-r from-green-400 to-accent-primary h-2 rounded-full"
                                style={{ width: `${Math.min(stat.conversion_rate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-bold text-yellow-400">
                              N${(stat.premium_conversions * 250000).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/50">
                              (10% × {stat.premium_conversions} conversions)
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Referrers */}
          {referrerStats.length > 0 && (
            <div className="bg-background-secondary/50 rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Top Referrers
              </h3>
              <div className="space-y-3">
                {referrerStats.slice(0, 5).map((stat, index) => (
                  <div key={stat.discord_id} className="flex items-center justify-between p-4 bg-background-primary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-accent-primary/20 text-accent-primary'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{stat.username}</p>
                        <p className="text-sm text-white/60">{stat.total_referrals} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        {stat.premium_conversions} conversions
                      </p>
                      <p className="text-sm text-white/60">
                        {stat.conversion_rate}% rate
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}