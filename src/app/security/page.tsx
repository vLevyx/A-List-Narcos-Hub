import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, AlertTriangle, ExternalLink, Key } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security | A-List Hub',
  description: 'Details of the security practices and protections implemented by A-List Hub.',
  keywords: 'security, data protection, access control, A-List Hub, Narcos Life, authentication, encryption',
  openGraph: {
    title: 'Security | A-List Hub',
    description: 'Details of the security practices and protections implemented by A-List Hub.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SecurityPage() {
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
          <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Security Measures
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            How we protect the platform, your account, and your data.
          </p>
          <p className="text-text-secondary">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Security Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">1. Authentication & Access Control</h2>
              <p className="text-text-secondary leading-relaxed">
                We use Discord OAuth exclusively for authentication to avoid handling credentials directly. Access to premium features is gated via a whitelist system with administrator approval. Each session is validated, and revoked or unauthorized access is blocked in real time.
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Discord OAuth (no passwords stored on our servers).</li>
                <li>Whitelist and revoked flags enforced via backend policies and role checks.</li>
                <li>Least-privilege design: users only get access to what they are approved for.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">2. Data Transport & Storage</h2>
              <p className="text-text-secondary leading-relaxed">
                All communication is encrypted in transit using HTTPS/TLS. Sensitive session and user state are stored securely following best practices, and access is audited.
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Encrypted transport (TLS) for all frontend/backend requests.</li>
                <li>Database access controlled with row-level security and policy-based permissions.</li>
                <li>Session tokens scoped and rotated appropriately to minimize risk.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">3. Monitoring & Incident Response</h2>
              <p className="text-text-secondary leading-relaxed">
                We log administrative actions and key security events to detect anomalies. Suspicious behavior such as account sharing, excessive failed access attempts, or exploitation attempts are flagged and can result in immediate suspension.
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Audit logs for admin operations (with real-time visibility in admin panel).</li>
                <li>Session tracking to detect orphaned or unusual activity.</li>
                <li>Incident response process includes notification via internal channels and, if needed, revocation of compromised access immediately.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">4. User Recommendations</h2>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Secure your Discord account: enable two-factor authentication.</li>
                <li>Do not share your account or whitelist credentials. Account sharing leads to immediate termination.</li>
                <li>Report suspicious activity via our verified Discord support channels.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">5. Vulnerability Handling</h2>
              <p className="text-text-secondary leading-relaxed">
                If you discover a security issue, please report it responsibly through our Discord. We do not offer bounty programs but will acknowledge and remediate verified vulnerabilities promptly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">6. Platform Hardening</h2>
              <p className="text-text-secondary leading-relaxed">
                Our stack is designed for defense-in-depth:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-1">
                <li>Strict Content Security Policies (CSP) on front-end assets.</li>
                <li>Rate limiting and anti-abuse protections to prevent automated system overload.</li>
                <li>Real-time access propagation for revocations and permission updates.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-2xl font-bold text-white">7. Changes to Security Practices</h2>
              <p className="text-text-secondary leading-relaxed">
                Security practices evolve. Major changes will be reflected here, and continued use implies acceptance of updates.
              </p>
            </section>
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/privacy"
            className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all duration-300 group"
          >
            <Lock className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
              Privacy Policy
            </h3>
            <p className="text-text-secondary text-sm">
              Learn how we collect and protect your data.
            </p>
          </Link>
          <Link
            href="/terms"
            className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all duration-300 group"
          >
            <Key className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
              Terms of Service
            </h3>
            <p className="text-text-secondary text-sm">
              Rules and responsibilities for using A-List Hub.
            </p>
          </Link>
        </div>

        {/* Contact */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Security Questions or Reports
          </h2>
          <p className="text-text-secondary mb-4">
            Reach out through our verified Discord if you have concerns, suspect compromise, or want to report a vulnerability.
          </p>
          <a
            href="https://discord.gg/9HaxJmPSpH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 transition"
          >
            Contact Security Support <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
