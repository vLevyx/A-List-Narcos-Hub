import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Lock, Database, ExternalLink, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | A-List Hub',
  description: 'Privacy Policy for A-List Hub - How we collect, use, and protect your personal information when using our Narcos Life platform.',
  keywords: 'privacy policy, data protection, personal information, A-List Hub, narcos life',
  openGraph: {
    title: 'Privacy Policy | A-List Hub',
    description: 'Privacy Policy for A-List Hub - How we collect, use, and protect your personal information.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 3, 2025"

  const dataTypes = [
    {
      title: "Discord Account Information",
      description: "Username, avatar, email address, and Discord ID",
      icon: "👤",
      required: true
    },
    {
      title: "Usage Analytics",
      description: "Page views, feature usage, and performance metrics",
      icon: "📊",
      required: false
    },
    {
      title: "Preference Settings",
      description: "Theme preferences, notification settings, and customizations",
      icon: "⚙️",
      required: false
    },
    {
      title: "Technical Data",
      description: "IP address, browser type, device information, and session data",
      icon: "💻",
      required: false
    }
  ]

  const protectionMeasures = [
    {
      title: "Encryption in Transit",
      description: "All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols.",
      icon: Lock
    },
    {
      title: "Secure Authentication",
      description: "We use Discord OAuth 2.0 for secure authentication without storing passwords or sensitive credentials.",
      icon: Shield
    },
    {
      title: "Data Minimization",
      description: "We only collect and store the minimum amount of data necessary to provide our services effectively.",
      icon: Database
    },
    {
      title: "Regular Security Audits",
      description: "Our systems undergo regular security reviews and updates to maintain the highest protection standards.",
      icon: Eye
    }
  ]

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "We collect information you provide directly when using our service, primarily through Discord OAuth authentication.",
        "Automatically collected information includes usage data, device information, and analytics to improve our service.",
        "We do not collect sensitive personal information such as financial data, health information, or government identification numbers.",
        "All data collection is limited to what is necessary for providing and improving our Narcos Life tools and community features."
      ]
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To provide, maintain, and improve our A-List Hub services and features.",
        "To authenticate your identity and manage your account access and permissions.",
        "To communicate with you about updates, security alerts, and community announcements.",
        "To analyze usage patterns and optimize the performance and user experience of our platform.",
        "To ensure platform security and prevent unauthorized access or malicious activities."
      ]
    },
    {
      title: "3. Information Sharing and Disclosure",
      content: [
        "We do not sell, trade, or rent your personal information to third parties for marketing purposes.",
        "Limited information may be shared with trusted service providers who assist in operating our platform (hosting, analytics).",
        "We may disclose information if required by law, court order, or to protect the rights and safety of our users and platform.",
        "In the event of a business transfer or acquisition, user data may be transferred as part of the transaction with equivalent privacy protections."
      ]
    },
    {
      title: "4. Data Retention and Storage",
      content: [
        "We retain your information only as long as necessary to provide our services and comply with legal obligations.",
        "Account data is stored securely using industry-standard encryption and access controls.",
        "Inactive accounts may be subject to data deletion after extended periods of non-use (typically 2+ years).",
        "You may request account deletion at any time through our Discord support channels.",
        "Certain aggregated and anonymized data may be retained for analytical purposes even after account deletion."
      ]
    },
    {
      title: "5. Your Privacy Rights",
      content: [
        "You have the right to access, update, or delete your personal information stored on our platform.",
        "You can withdraw consent for data processing at any time by contacting us through official channels.",
        "You may opt out of non-essential data collection such as analytics and usage tracking.",
        "You have the right to data portability - we can provide your data in a machine-readable format upon request.",
        "You may file complaints with relevant data protection authorities if you believe your rights have been violated."
      ]
    },
    {
      title: "6. Cookies and Tracking Technologies",
      content: [
        "We use essential cookies for authentication, session management, and basic functionality.",
        "Analytics cookies help us understand how users interact with our platform to improve the experience.",
        "We do not use third-party advertising cookies or tracking for marketing purposes.",
        "You can control cookie preferences through your browser settings, though some features may be limited.",
        "We respect 'Do Not Track' signals and similar privacy preferences where technically feasible."
      ]
    },
    {
      title: "7. Third-Party Services",
      content: [
        "We integrate with Discord for authentication and community features - Discord's privacy policy applies to their services.",
        "Our hosting and infrastructure providers (such as Vercel and Supabase) have access to technical data as necessary for service operation.",
        "We use analytics services to understand usage patterns, with data anonymized whenever possible.",
        "All third-party services are carefully vetted for privacy and security compliance.",
        "We maintain data processing agreements with all service providers to ensure your privacy protection."
      ]
    },
    {
      title: "8. International Data Transfers",
      content: [
        "Your data may be processed and stored in countries other than your own, including the United States.",
        "We ensure adequate protection for international data transfers through appropriate safeguards and agreements.",
        "All data transfers comply with applicable privacy laws including GDPR, CCPA, and other regional regulations.",
        "You have the right to be informed about and object to international data transfers where applicable."
      ]
    },
    {
      title: "9. Children's Privacy",
      content: [
        "Our service is intended for users aged 13 and older, consistent with Discord's terms of service.",
        "We do not knowingly collect personal information from children under 13 years of age.",
        "If we become aware that we have collected information from a child under 13, we will take steps to delete such information.",
        "Parents or guardians may contact us if they believe their child has provided personal information to our service."
      ]
    },
    {
      title: "10. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.",
        "Material changes will be communicated through our Discord server and website notifications.",
        "Your continued use of our service after changes constitutes acceptance of the updated privacy policy.",
        "We encourage you to review this policy periodically to stay informed about how we protect your information."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">Privacy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-text-secondary">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Our Privacy Commitment</h3>
              <p className="text-text-secondary leading-relaxed">
                We are committed to protecting your privacy and being transparent about our data practices. 
                We collect only what we need, use it responsibly, and give you control over your information.
              </p>
            </div>
          </div>
        </div>

        {/* Data We Collect */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-400" />
            Data We Collect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypes.map((type, index) => (
              <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{type.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      type.required 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {type.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Protection Measures */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            How We Protect Your Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {protectionMeasures.map((measure, index) => {
              const IconComponent = measure.icon
              return (
                <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <IconComponent className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">{measure.title}</h3>
                      <p className="text-text-secondary text-sm">{measure.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Policy */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="border-b border-white/10 pb-8 last:border-b-0 last:pb-0">
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-text-secondary leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/terms"
            className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all duration-300 group"
          >
            <Shield className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
              Terms of Service
            </h3>
            <p className="text-text-secondary text-sm">
              Review our terms and conditions for using A-List Hub.
            </p>
          </Link>
          
          <Link
            href="/security"
            className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all duration-300 group"
          >
            <Lock className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Security Measures
            </h3>
            <p className="text-text-secondary text-sm">
              Learn about our comprehensive security implementations.
            </p>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Privacy Questions or Concerns?</h2>
          <p className="text-text-secondary mb-6">
            If you have questions about this Privacy Policy or how we handle your data, please contact us through our Discord server.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              Contact Support
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/docs"
              className="btn-outline px-6 py-3 rounded-lg font-semibold"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}