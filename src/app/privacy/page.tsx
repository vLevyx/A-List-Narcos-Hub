import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, FileText, ExternalLink, EyeOff, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | A-List Hub',
  description: 'How A-List Hub collects, uses, and protects your personal information for Narcos Life players.',
  keywords: 'privacy policy, data protection, A-List Hub, Narcos Life, Discord OAuth, user data',
  openGraph: {
    title: 'Privacy Policy | A-List Hub',
    description: 'How A-List Hub collects, uses, and protects your personal information for Narcos Life players.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 3, 2025"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">Privacy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Your privacy matters. This policy explains what data we collect, why, and how we protect it.
          </p>
          <p className="text-text-secondary">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
              <p className="text-text-secondary leading-relaxed">
                We collect only the information necessary to provide and improve the A-List Hub experience. This includes:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Discord profile data (username, avatar, discord_id) via OAuth for authentication.</li>
                <li>Whitelist status, access metadata, and usage metrics to manage permissions and sessions.</li>
                <li>User-generated content you submit via the platform (e.g., blueprint selections, feedback).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">2. How We Use Your Data</h2>
              <p className="text-text-secondary leading-relaxed">
                Your data is used to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Authenticate and authorize access through Discord OAuth and whitelist logic.</li>
                <li>Personalize and persist your blueprint/feature selections and session tracking.</li>
                <li>Detect abuse and enforce acceptable use (e.g., account sharing prevention, security monitoring).</li>
                <li>Respond to support inquiries submitted via official channels.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">3. Data Sharing and Disclosure</h2>
              <p className="text-text-secondary leading-relaxed">
                We do not sell your personal information. We may share data in the following limited contexts:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>With authorized administrators for whitelist, access, and moderation purposes.</li>
                <li>When required by law or to protect the rights and safety of the platform and its users.</li>
                <li>With third-party services strictly as needed for authentication (e.g., Discord) under their own privacy terms.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">4. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your information for as long as necessary to provide services, enforce policies, and comply with legal obligations. You can request deletion of your personal data; see the section below.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">5. Your Rights</h2>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>
                  <strong>Access:</strong> You can request a copy of the data we hold about you.
                </li>
                <li>
                  <strong>Deletion:</strong> You may request that we delete your personal data. This can be done by contacting support via our verified Discord server.
                </li>
                <li>
                  <strong>Security:</strong> You are responsible for securing your Discord account; we recommend enabling 2FA on Discord.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">6. Security Measures</h2>
              <p className="text-text-secondary leading-relaxed">
                We implement industry-standard practices to protect your data, including:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>OAuth via Discord to avoid storing passwords.</li>
                <li>Strict access controls (whitelisting, revoked flags) enforced through backend policies.</li>
                <li>Encrypted transport (HTTPS) and secure session handling.</li>
                <li>Audit logging for administrative actions.</li>
              </ul>
              <p className="text-text-secondary">
                Despite best efforts, no system is perfectly secure. We do not guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">7. Third-Party Links</h2>
              <p className="text-text-secondary leading-relaxed">
                Links to external sites (e.g., Discord) are provided for convenience. We are not responsible for their content or privacy practices. Review their policies separately. 
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">8. Contact & Requests</h2>
              <p className="text-text-secondary leading-relaxed">
                For any privacy-related inquiries or data requests, contact us through our verified Discord server. We aim to respond within 48 hours during normal business operations.
              </p>
              <p className="text-text-secondary">
                Support link:{' '}
                <a
                  href="https://discord.gg/9HaxJmPSpH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  Discord Support <ExternalLink className="w-4 h-4 inline" />
                </a>
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-2xl font-bold text-white">9. Changes to This Policy</h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this policy periodically. Revisions are effective immediately upon posting. Continued use constitutes acceptance.
              </p>
            </section>
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/security"
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all duration-300 group"
          >
            <Shield className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
              Security Measures
            </h3>
            <p className="text-text-secondary text-sm">
              Learn how we protect the platform and your data in depth.
            </p>
          </Link>
          <Link
            href="/terms"
            className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all duration-300 group"
          >
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
              Terms of Service
            </h3>
            <p className="text-text-secondary text-sm">
              Your rights and responsibilities when using A-List Hub.
            </p>
          </Link>
        </div>

        {/* Footer Contact */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Info className="w-6 h-6 text-yellow-400" />
            Need Help or Have a Concern?
          </h2>
          <p className="text-text-secondary mb-4">
            Reach out via our verified Discord server for any privacy or data questions.
          </p>
          <a
            href="https://discord.gg/9HaxJmPSpH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 transition"
          >
            Contact Support <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
