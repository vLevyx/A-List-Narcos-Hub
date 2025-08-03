'use client'

import { motion } from 'framer-motion'
import { Users, MessageSquare, Heart, Sparkles } from 'lucide-react'

// Discord Icon Component
const DiscordIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`${className} text-white`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
)

export function AboutSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
    >
      {/* Discord Community CTA */}
      <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 mb-16 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-xl" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">Join Our Community</span>
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-4">Connect with Fellow Players</h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Join hundreds of players in our Discord community. Get instant support, 
            share strategies, participate in events, and help shape the future of A-List tools.
          </p>
          
          <a
            href="https://discord.gg/9HaxJmPSpH"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center py-4 px-8 rounded-xl font-semibold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
          >
            {/* Glass overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/20"></div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
            
            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-3">
              <DiscordIcon className="w-6 h-6" />
              <span className="font-bold tracking-wide">Join Our Discord</span>
            </span>
          </a>
        </div>
      </div>

      {/* About Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Built with Passion</span>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            About <span className="gradient-text">A-List</span>
          </h2>
          
          <div className="space-y-6 text-white/90 text-lg leading-relaxed">
            <p>
              <strong className="text-purple-300">A-List is a community-driven hub built by players, for players</strong> — 
              designed to make your Narcos Life experience smarter, smoother, and more immersive.
            </p>
            <p>
              What began as a simple idea has grown into a comprehensive toolkit, 
              <strong className="text-purple-300"> shaped by the voices of our team and community</strong>. 
              Our advanced calculators, guides, and tools are constantly evolving based on player feedback.
            </p>
            <p>
              <strong className="text-purple-300">A-List runs on passion and teamwork</strong>. 
              We're not just building tools — we're living the game alongside you, ensuring you always 
              have the support and competitive edge to enjoy Narcos Life to the fullest.
            </p>
          </div>
        </div>

        {/* Right Content - Feature Highlights */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Tools</h3>
                <p className="text-white/70">
                  Advanced calculators and guides that give you the edge.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Community Driven</h3>
                <p className="text-white/70">
                  Every feature is shaped by player feedback and real gameplay experiences.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Always Evolving</h3>
                <p className="text-white/70">
                  Regular updates, new features, and continuous improvements based on your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}