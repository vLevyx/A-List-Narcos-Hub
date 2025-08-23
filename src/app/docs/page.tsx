import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Construction, 
  ExternalLink, 
  MessageSquare,
  Clock,
  BookOpen,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Documentation Coming Soon | A-List Hub',
  description: 'Documentation for A-List Hub is currently in development. Join our Discord community for updates and early access to guides.',
  keywords: 'documentation, coming soon, development, narcos life, A-List Hub, discord, community',
  openGraph: {
    title: 'Documentation Coming Soon | A-List Hub',
    description: 'Documentation for A-List Hub is currently in development. Join our Discord community for updates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation Coming Soon | A-List Hub',
    description: 'Documentation for A-List Hub is currently in development. Join our Discord community for updates.',
  },
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary flex items-center justify-center">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 bg-orange-500/20 border border-orange-500/30 rounded-full px-6 py-3 mb-8">
            <Construction className="w-5 h-5 text-orange-400 animate-bounce" />
            <span className="text-orange-300 font-semibold">In Development</span>
          </div>
          
          {/* Main Heading */}
          <div className="mb-8">
            <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Documentation
              <span className="block text-purple-400 text-2xl md:text-3xl mt-2 font-medium">
                Coming Soon
              </span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              We're crafting comprehensive guides, tutorials, and resources to help you succeed in Narcos Life. 
              Stay tuned for detailed documentation covering all our tools and features.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Estimated Launch: N/A</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 max-w-md mx-auto">
              <div className="bg-gradient-purple h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="border-t border-white/10 pt-8">
            <h2 className="text-xl font-semibold text-white mb-6">What to Expect</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-white font-medium mb-2">Comprehensive Guides</h3>
                <p className="text-text-secondary">Step-by-step tutorials for all features</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-white font-medium mb-2">Community Tips</h3>
                <p className="text-text-secondary">Best practices from experienced players</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Construction className="w-4 h-4 text-green-400" />
                </div>
                <h3 className="text-white font-medium mb-2">Regular Updates</h3>
                <p className="text-text-secondary">Documentation that grows with new features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-text-secondary/60 text-sm mt-8">
          In the meantime, join our Discord community for support and early access to guides
        </p>
      </div>
    </div>
  )
}