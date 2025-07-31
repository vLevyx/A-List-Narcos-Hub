'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, RefreshCw, Zap } from 'lucide-react'

const tips = [
  {
    text: "Always lock your vehicle to prevent theft!",
    category: "Security",
    icon: "🔒"
  },
  {
    text: "Combine your backpack and trunk to get more capacity during gathering.",
    category: "Optimization",
    icon: "🎒"
  },
  {
    text: "Start at the copper mine north of Montignac for a low-risk, high-return start.",
    category: "Strategy",
    icon: "⛏️"
  },
  {
    text: "Always smelt ores before selling. Raw ore has no value",
    category: "Economy",
    icon: "🔥"
  },
  {
    text: "Group up to run high-volume ore trips or protect each other from gangs — safer and faster.",
    category: "Teamwork",
    icon: "👥"
  },
  {
    text: "Use T (On PC) for push-to-talk. Good comms can defuse tense RP moments.",
    category: "Communication",
    icon: "🎤"
  },
  {
    text: "A Positive+++ reputation gives you up to 19% OFF market purchases!",
    category: "Economy",
    icon: "⭐"
  },
  {
    text: "Avoid RDM, VDM, CL, and Metagaming — all bannable offenses. Read the rules!",
    category: "Rules",
    icon: "⚠️"
  },
  {
    text: "No tools needed to gather resources.",
    category: "Basics",
    icon: "🌿"
  },
  {
    text: "Buy larger trucks like the M923A1 Transport Truck for 50+ ore capacity.",
    category: "Vehicles",
    icon: "🚛"
  },
  {
    text: "Reach Level 7 Smelting to unlock faster furnace processing — huge time saver.",
    category: "Skills",
    icon: "🔧"
  },
  {
    text: "Pick a profession like Police to earn money, and server reputation.",
    category: "Career",
    icon: "👮"
  },
  {
    text: "Always stay in-character. OOC chat is restricted and can ruin immersion.",
    category: "Roleplay",
    icon: "🎭"
  },
  {
    text: "Never Combat Log (CL). It's a serious offense — always RP through situations.",
    category: "Rules",
    icon: "🚫"
  },
  {
    text: "Use lockers in major towns for secure 200-slot storage. One-time $1M fee.",
    category: "Storage",
    icon: "🏦"
  },
  {
    text: "Helis are expensive and require rare HQ parts. Plan long-term before investing.",
    category: "Vehicles",
    icon: "🚁"
  },
  {
    text: "Check ammo compatibility using A-List Hub or weapon guides before crafting mags.",
    category: "Combat",
    icon: "🔫"
  },
  {
    text: "Trust no one outside safe zones. Lock your doors — even when smelting.",
    category: "Security",
    icon: "🛡️"
  },
  {
    text: "Follow the New Life Rule (NLR): stay away from your death location for a while.",
    category: "Rules",
    icon: "💀"
  },
  {
    text: "Track item demand in your phone — timing the market can double your income.",
    category: "Economy",
    icon: "📱"
  }
]

const categoryColors = {
  "Security": "text-red-400 bg-red-500/20 border-red-500/30",
  "Optimization": "text-blue-400 bg-blue-500/20 border-blue-500/30",
  "Strategy": "text-green-400 bg-green-500/20 border-green-500/30",
  "Economy": "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  "Teamwork": "text-purple-400 bg-purple-500/20 border-purple-500/30",
  "Communication": "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
  "Rules": "text-orange-400 bg-orange-500/20 border-orange-500/30",
  "Basics": "text-gray-400 bg-gray-500/20 border-gray-500/30",
  "Vehicles": "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
  "Skills": "text-teal-400 bg-teal-500/20 border-teal-500/30",
  "Career": "text-pink-400 bg-pink-500/20 border-pink-500/30",
  "Roleplay": "text-violet-400 bg-violet-500/20 border-violet-500/30",
  "Storage": "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  "Combat": "text-rose-400 bg-rose-500/20 border-rose-500/30"
}

export function TipSection() {
  const [currentTip, setCurrentTip] = useState(tips[0])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setCurrentTip(tips[Math.floor(Math.random() * tips.length)])
  }, [])

  const getNewTip = () => {
    setIsAnimating(true)
    setTimeout(() => {
      let newTip
      do {
        newTip = tips[Math.floor(Math.random() * tips.length)]
      } while (newTip.text === currentTip.text && tips.length > 1)
      
      setCurrentTip(newTip)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
    >
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Pro Tip</h3>
                <p className="text-white/60 text-sm">Essential knowledge for ELAN Life</p>
              </div>
            </div>
            
            <button
              onClick={getNewTip}
              disabled={isAnimating}
              className="group p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Get new tip"
            >
              <RefreshCw className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${
                isAnimating ? 'animate-spin' : 'group-hover:rotate-180'
              }`} />
            </button>
          </div>

          {/* Tip Content */}
          <div className={`transition-all duration-200 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                {currentTip.icon}
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-lg leading-relaxed">
                  {currentTip.text}
                </p>
              </div>
            </div>
            
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${
                categoryColors[currentTip.category as keyof typeof categoryColors] || categoryColors.Basics
              }`}>
                <Zap className="w-3 h-3" />
                {currentTip.category}
              </span>
              
              <span className="text-xs text-white/50">
                Tip #{tips.indexOf(currentTip) + 1} of {tips.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}