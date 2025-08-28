// docs page
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  BookOpen, 
  ExternalLink, 
  MessageSquare,
  Lightbulb,
  Users,
  Calculator
} from 'lucide-react'
import { DocumentationContainer } from '@/components/docs/DocumentationContainer'

export const metadata: Metadata = {
  title: 'Documentation | A-List Hub',
  description: 'Complete documentation for A-List Hub - guides, tutorials, and resources for Narcos Life players.',
  keywords: 'documentation, guides, tutorials, narcos life, A-List Hub, help, support',
  openGraph: {
    title: 'Documentation | A-List Hub',
    description: 'Complete documentation for A-List Hub - guides, tutorials, and resources for Narcos Life players.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | A-List Hub',
    description: 'Complete documentation for A-List Hub - guides, tutorials, and resources for Narcos Life players.',
  },
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">Documentation</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Know
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
            Guides, tutorials, and resources to help you make the most of A-List Hub.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/3dz8WuazAc"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-purple text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
              Join Discord Community
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/whitelist"
              className="border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white hover:shadow-lg hover:shadow-purple-500/25 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Documentation Sections - Client Component */}
        <DocumentationContainer />

        {/* Quick Access Cards */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/whitelist"
              className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 group"
            >
              <Users className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Join Whitelist
              </h3>
              <p className="text-text-secondary text-sm">
                Get access to premium tools and features
              </p>
            </Link>
            
            <a
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 group"
            >
              <MessageSquare className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Discord Server
              </h3>
              <p className="text-text-secondary text-sm">
                Join our community for support and updates
              </p>
            </a>
            
            <Link
              href="/"
              className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 group"
            >
              <Calculator className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                Explore Tools
              </h3>
              <p className="text-text-secondary text-sm">
                Try our calculators and utilities
              </p>
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-text-secondary mb-6">
            Can't find what you're looking for? Our community is here to help.
          </p>
          <a
            href="https://discord.gg/3dz8WuazAc"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-purple text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            Get Support on Discord
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}