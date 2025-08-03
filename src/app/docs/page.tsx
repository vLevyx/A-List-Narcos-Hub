import { Metadata } from 'next'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Shield, 
  Zap, 
  ExternalLink, 
  ChevronRight,
  MessageSquare,
  FileText,
  Lightbulb
} from 'lucide-react'

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
  const sections = [
    {
      title: "Getting Started",
      description: "Learn the basics of using A-List Hub",
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      items: [
        { title: "Account Setup", href: "#account-setup" },
        { title: "Discord Integration", href: "#discord-integration" },
        { title: "Whitelist Process", href: "#whitelist-process" },
        { title: "First Steps", href: "#first-steps" }
      ]
    },
    {
      title: "Tools & Features",
      description: "Comprehensive guide to all available tools",
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      items: [
        { title: "Price Calculators", href: "#price-calculators" },
        { title: "Blueprint Database", href: "#blueprint-database" },
        { title: "License Pricing", href: "#license-pricing" },
        { title: "Vehicle Information", href: "#vehicle-information" }
      ]
    },
    {
      title: "Community",
      description: "Connect with other players and get support",
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      items: [
        { title: "Discord Community", href: "https://discord.gg/9HaxJmPSpH", external: true },
        { title: "Community Guidelines", href: "#community-guidelines" },
        { title: "Reporting Issues", href: "#reporting-issues" },
        { title: "Feature Requests", href: "#feature-requests" }
      ]
    },
    {
      title: "Security & Privacy",
      description: "Understanding our security measures",
      icon: Shield,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      items: [
        { title: "Data Protection", href: "/privacy" },
        { title: "Security Measures", href: "/security" },
        { title: "Account Security", href: "#account-security" },
        { title: "Privacy Controls", href: "#privacy-controls" }
      ]
    }
  ]

  const faqs = [
    {
      question: "What is A-List Hub?",
      answer: "A-List Hub is a premium platform providing advanced tools and resources for Narcos Life players. We offer calculators, databases, guides, and community features to enhance your gaming experience."
    },
    {
      question: "How do I get whitelisted?",
      answer: "To get whitelisted, you need an active Discord account, must join our Discord server, and get verified by an administrator. The process ensures we maintain a high-quality community."
    },
    {
      question: "Is A-List Hub free?",
      answer: "A-List Hub offers both free and premium features. Basic access is available to all whitelisted users, with additional premium tools available for supporters of the platform."
    },
    {
      question: "How do I report bugs or issues?",
      answer: "You can report bugs or issues through our Discord server in the support channels. Our team actively monitors these channels and will respond promptly to help resolve any problems."
    },
    {
      question: "Can I contribute to A-List Hub?",
      answer: "Yes! We welcome community contributions including feedback, feature suggestions, and bug reports. Join our Discord community to get involved in discussions about future development."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
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
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Comprehensive guides, tutorials, and resources to help you make the most of A-List Hub and dominate in Narcos Life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Join Discord Community
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              href="/whitelist"
              className="btn-outline px-6 py-3 rounded-lg font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <div
                key={section.title}
                className={`${section.bgColor} ${section.borderColor} border rounded-2xl p-6 hover:bg-opacity-80 transition-all duration-300`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                    <p className="text-text-secondary text-sm">{section.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <span className="text-text-secondary group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                          <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <span className="text-text-secondary group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/whitelist"
              className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 group"
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
              className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 group"
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
              href="/security"
              className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 group"
            >
              <Shield className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                Security Info
              </h3>
              <p className="text-text-secondary text-sm">
                Learn about our security measures
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-text-secondary mb-6">
            Can't find what you're looking for? Our community is here to help.
          </p>
          <a
            href="https://discord.gg/9HaxJmPSpH"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
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