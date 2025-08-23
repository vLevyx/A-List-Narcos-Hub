import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Shield, AlertTriangle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | A-List Hub',
  description: 'Terms of Service for A-List Hub - Your rights and responsibilities when using our Narcos Life tools and platform.',
  keywords: 'terms of service, legal, user agreement, A-List Hub, narcos life',
  openGraph: {
    title: 'Terms of Service | A-List Hub',
    description: 'Terms of Service for A-List Hub - Your rights and responsibilities when using our platform.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  const lastUpdated = "August 3, 2025"

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using A-List Hub, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These Terms of Service apply to all users of the A-List Hub platform, including whitelisted members and visitors."
      ]
    },
    {
      title: "2. Description of Service",
      content: [
        "A-List Hub provides tools, calculators, and community features specifically designed for Narcos Life players.",
        "Our services include but are not limited to: price calculators, license information, vehicle data, and community forums.",
        "We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without prior notice."
      ]
    },
    {
      title: "3. User Accounts and Whitelist",
      content: [
        "To access premium features, users must go through our whitelist process, which requires Discord verification and administrator approval.",
        "You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.",
        "We reserve the right to terminate accounts that violate these terms or engage in prohibited activities.",
        "Account sharing is strictly prohibited and may result in immediate termination."
      ]
    },
    {
      title: "4. Acceptable Use Policy",
      content: [
        "Users must not use our service for any unlawful purpose or to solicit the performance of unlawful acts.",
        "Attempts to exploit, hack, or compromise our systems will result in immediate account termination and may be reported.",
        "Users must respect intellectual property rights and not share premium content with non-whitelisted individuals.",
        "Any form of spam, automated requests, or attempts to overload our systems is prohibited."
      ]
    },
    {
      title: "5. Content and Intellectual Property",
      content: [
        "All content provided on A-List Hub, including but not limited to text, graphics, logos, and software, is owned by A-List Hub or its licensors.",
        "Users may not reproduce, distribute, or create derivative works from our content without explicit written permission.",
        "User-generated content remains the property of the user, but by posting, you grant us a license to use, modify, and display such content.",
        "We respect the intellectual property of others and expect users to do the same."
      ]
    },
    {
      title: "6. Privacy and Data Protection",
      content: [
        "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.",
        "We use Discord OAuth for authentication and may store basic profile information provided by Discord.",
        "We implement industry-standard security measures to protect user data, but cannot guarantee absolute security.",
        "Users may request data deletion by contacting us through official channels."
      ]
    },
    {
      title: "7. Disclaimers and Limitations",
      content: [
        "A-List Hub is provided 'as is' without any warranties, express or implied.",
        "We do not guarantee the accuracy, completeness, or timeliness of information provided on our platform.",
        "We are not responsible for any damages arising from the use or inability to use our service.",
        "Our liability is limited to the maximum extent permitted by law.",
        "Information provided is for Narcos Life gameplay purposes only and should not be considered as real-world advice."
      ]
    },
    {
      title: "8. Termination",
      content: [
        "We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including breach of Terms.",
        "Upon termination, your right to use the service will cease immediately.",
        "Termination does not relieve you of any obligations incurred prior to termination.",
        "We reserve the right to refuse service to anyone for any reason at any time."
      ]
    },
    {
      title: "9. Changes to Terms",
      content: [
        "We reserve the right to modify these terms at any time without prior notice.",
        "Changes will be effective immediately upon posting on our website.",
        "Continued use of the service after changes constitutes acceptance of the new terms.",
        "Users are encouraged to review these terms periodically."
      ]
    },
    {
      title: "10. Contact Information",
      content: [
        "For questions about these Terms of Service, please contact us through our Discord server.",
        "Official support is only provided through our verified Discord channels.",
        "We aim to respond to all inquiries within 48 hours during normal operations."
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
          <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-500/30 rounded-full px-6 py-3 mb-6">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-semibold">Legal</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Please read these Terms of Service carefully before using A-List Hub.
          </p>
          <p className="text-text-secondary">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-400 font-semibold mb-2">Important Notice</h3>
              <p className="text-text-secondary leading-relaxed">
                By using A-List Hub, you agree to these Terms of Service. If you do not agree with any part of these terms, 
                you must not use our service. These terms may be updated from time to time, and continued use constitutes acceptance of changes.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
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
            href="/privacy"
            className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all duration-300 group"
          >
            <Shield className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Privacy Policy
            </h3>
            <p className="text-text-secondary text-sm">
              Learn how we collect, use, and protect your personal information.
            </p>
          </Link>
          
          <Link
            href="/security"
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all duration-300 group"
          >
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
              Security Measures
            </h3>
            <p className="text-text-secondary text-sm">
              Understand the security measures we implement to protect our platform.
            </p>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Questions About These Terms?</h2>
          <p className="text-text-secondary mb-6">
            If you have any questions about these Terms of Service, please contact us through our Discord server.
          </p>
          <a
            href="https://discord.gg/9HaxJmPSpH"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            Contact Support
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}