import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Key,
  Database,
  Zap,
  Globe
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security | A-List Hub',
  description: 'Learn about A-List Hub\'s comprehensive security measures, data protection protocols, and how we keep your information safe.',
  keywords: 'security, data protection, encryption, authentication, A-List Hub, narcos life',
  openGraph: {
    title: 'Security | A-List Hub',
    description: 'Learn about A-List Hub\'s comprehensive security measures and data protection protocols.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SecurityPage() {
  const lastUpdated = "August 3, 2025"

  const securityFeatures = [
    {
      title: "Discord OAuth 2.0 Authentication",
      description: "Secure authentication without password storage using industry-standard OAuth 2.0 protocols",
      icon: Key,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "End-to-End Encryption",
      description: "All data transmitted between your device and our servers is encrypted using TLS 1.3",
      icon: Lock,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Database Security",
      description: "PostgreSQL with row-level security policies and encrypted storage at rest",
      icon: Database,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Infrastructure Security",
      description: "Hosted on Vercel and Supabase with enterprise-grade security and monitoring",
      icon: Server,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "Real-time Monitoring",
      description: "24/7 monitoring for suspicious activities, security threats, and performance issues",
      icon: Eye,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      title: "Rate Limiting",
      description: "Advanced rate limiting and DDoS protection to prevent abuse and ensure availability",
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    }
  ]

  const complianceStandards = [
    {
      title: "OWASP Top 10",
      description: "Regular security audits following OWASP guidelines",
      status: "Compliant"
    },
    {
      title: "SOC 2 Type II",
      description: "Infrastructure providers maintain SOC 2 compliance",
      status: "Inherited"
    },
    {
      title: "GDPR",
      description: "European data protection regulation compliance",
      status: "Compliant"
    },
    {
      title: "CCPA",
      description: "California Consumer Privacy Act compliance",
      status: "Compliant"
    }
  ]

  const securityPractices = [
    {
      title: "Data Minimization",
      practices: [
        "We collect only the minimum data necessary for service operation",
        "Regular data audits to remove unnecessary information",
        "Automatic data purging for inactive accounts",
        "User-controlled data retention preferences"
      ]
    },
    {
      title: "Access Controls",
      practices: [
        "Role-based access control (RBAC) for all system components",
        "Multi-factor authentication for administrative access",
        "Principle of least privilege for all user accounts",
        "Regular access reviews and permission audits"
      ]
    },
    {
      title: "Incident Response",
      practices: [
        "24/7 security monitoring and alerting systems",
        "Documented incident response procedures",
        "Automated threat detection and response",
        "Regular security incident simulation exercises"
      ]
    },
    {
      title: "Code Security",
      practices: [
        "Static application security testing (SAST) in CI/CD pipeline",
        "Dependency vulnerability scanning and updates",
        "Secure coding practices and peer code reviews",
        "Regular penetration testing by third-party experts"
      ]
    }
  ]

  const reportingProcess = [
    {
      step: "1. Identify the Issue",
      description: "Document the security concern with as much detail as possible",
      icon: "🔍"
    },
    {
      step: "2. Report Through Discord",
      description: "Contact our security team through the official Discord support channels",
      icon: "📞"
    },
    {
      step: "3. Initial Response",
      description: "We'll acknowledge your report within 24 hours and begin investigation",
      icon: "⏰"
    },
    {
      step: "4. Investigation & Fix",
      description: "Our team will investigate and implement fixes for confirmed issues",
      icon: "🔧"
    },
    {
      step: "5. Follow-up",
      description: "We'll keep you informed of progress and resolution status",
      icon: "✅"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-red-500/20 border border-red-500/30 rounded-full px-6 py-3 mb-6">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-semibold">Security</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Security & Protection
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Your security is our top priority. Learn about the comprehensive measures we implement to protect your data and ensure platform integrity.
          </p>
          <p className="text-text-secondary">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Security Status */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-16">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-green-400 font-semibold">All Systems Secure</h3>
                <p className="text-text-secondary text-sm">
                  No known security incidents. Last security audit: July 2025
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className={`${feature.bgColor} ${feature.borderColor} border rounded-xl p-6 hover:bg-opacity-80 transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-8 h-8 ${feature.color}`} />
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Compliance & Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <h3 className="text-white font-semibold mb-1">{standard.title}</h3>
                  <p className="text-text-secondary text-sm">{standard.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  standard.status === 'Compliant' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {standard.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Practices */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Security Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityPractices.map((category, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.practices.map((practice, pIndex) => (
                    <li key={pIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary text-sm">{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Security Reporting */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Security Issue Reporting
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Found a security vulnerability? We appreciate responsible disclosure and will work with you to resolve any issues quickly and safely.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportingProcess.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{step.step}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              Report Security Issue
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
            href="/terms"
            className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all duration-300 group"
          >
            <Lock className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
              Terms of Service
            </h3>
            <p className="text-text-secondary text-sm">
              Review our terms and conditions for using A-List Hub.
            </p>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Security Questions?</h2>
          <p className="text-text-secondary mb-6">
            Have questions about our security measures or need to report a concern? Contact our security team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/9HaxJmPSpH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              Contact Security Team
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