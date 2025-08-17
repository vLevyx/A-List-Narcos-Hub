"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { FeatureCard } from './FeatureCard';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Crafting Calculator",
    description: "Advanced recipe calculations and cost analysis",
    href: "/calculator",
    requiresAccess: true,
    tag: "New!",
    tagType: "new" as const,
  },
  {
    title: "Server Status",
    description: "Live Narcos Life server information and player count",
    href: "/server-status",
    requiresAccess: false,
    tag: "Live!",
    tagType: "live" as const,
  },
  {
    title: "General Information",
    description: "Complete pricing guide and Narcos information",
    href: "/general-info",
    requiresAccess: false,
    tag: "Updated!",
    tagType: "updated" as const,
  },
  {
    title: "Starter Guide",
    description: "Essential guide for new players",
    href: "/starter-guide",
    requiresAccess: false,
  }
];

export function HeroSection() {
  const { hasAccess } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-400/4 rounded-full blur-2xl float" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isClient ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Premium Roleplay Tools</span>
            </div>
            
            <div className="text-center">
  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-2 tracking-tight">
    <span className="gradient-text">A-List Hub</span>
  </h1>
  <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/80 mb-6">
    <span className="text-purple-300 font-bold">Narcos</span>
  </div>
</div>
            
            <p className="text-xl sm:text-2xl text-white/90 mb-2 font-light">
              Everything you need for <strong className="text-purple-300">Narcos Life</strong>
            </p>
            
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Tools and resources designed for dedicated players
            </p>
          </motion.div>

          {/* Seamless Feature & CTA Section */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.title} 
                  variants={itemVariants}
                  custom={index}
                >
                  <FeatureCard {...feature} hasAccess={hasAccess} />
                </motion.div>
              ))}
            </div>

            {/* Seamless Premium Access Section */}
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              {/* Connecting gradient line */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-purple-500/30 to-transparent"></div>
              
              <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
                {/* Premium glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 rounded-3xl"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center max-w-3xl mx-auto">
                  {/* Status Badge */}
                  <div className="mb-8">
                    {hasAccess ? (
                      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3 backdrop-blur-sm">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-green-400 font-semibold text-lg">A-List Plus Member</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full px-6 py-3 backdrop-blur-sm">
                        <Shield className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-semibold text-lg">Premium Access Available</span>
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                    {hasAccess ? (
                      <>Welcome Back, <span className="gradient-text">Plus Member</span></>
                    ) : (
                      <>Unlock <span className="gradient-text">Premium Features</span></>
                    )}
                  </h2>
                  
                  <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
                    {hasAccess 
                      ? "Access all premium tools and enjoy the full A-List experience with priority support and exclusive features."
                      : "Join the dedicated players with exclusive access to advanced calculators, comprehensive guides, and premium tools that give you the competitive edge."
                    }
                  </p>

                  {/* Premium Action Button */}
                  <Link
                    href="/whitelist"
                    className="group relative inline-flex items-center justify-center py-5 px-10 rounded-2xl font-bold text-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-black transform hover:scale-[1.02] transition-all duration-300 shadow-2xl hover:shadow-amber-500/30 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
                  >
                    {/* Enhanced glass overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/20 to-white/40"></div>
                    
                    {/* Premium shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12"></div>
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-amber-400/20 via-yellow-500/20 to-orange-500/20"></div>
                    </div>
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-3">
                      {hasAccess ? (
                        <>
                          <Crown className="w-6 h-6" />
                          <span>Refer us, Get paid</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6" />
                          <span>Get A-List Plus</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </span>
                  </Link>

                  {/* Benefits Text */}
                  {!hasAccess && (
                    <div className="mt-6 space-y-2">
                      <p className="text-white/60 text-sm">
                        7-day free trial •  Full unlocked access •  Zero obligation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}