"use client"

import Link from "next/link"
import { Shield, Github, ExternalLink } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Home", href: "/" },
        { label: "Profile", href: "/profile" },
        { label: "Whitelist", href: "/whitelist" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Discord Server", href: "#", external: true },
        { label: "Documentation", href: "#" },
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Security", href: "/security" },
      ]
    }
  ]

  return (
    <footer className="bg-background-secondary/50 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold gradient-text">
                  A-List Narcos
                </span>
                <span className="text-xs text-text-secondary -mt-1">Hub</span>
              </div>
            </Link>
            <p className="text-text-secondary text-sm mb-4 max-w-xs">
              Premium tools and secure infrastructure for professional operations. 
              Built for those who demand excellence.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">All systems operational</span>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-accent-primary transition-colors duration-200 text-sm flex items-center group"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-text-secondary hover:text-accent-primary transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-text-secondary text-sm">
                © {currentYear} The A-List. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary text-xs">Built with 💜 by Levy </span>
                <div className="flex items-center space-x-1 text-xs text-accent-primary">
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                <span>v0.0.1 | DEVELOPMENT</span>
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center space-x-2 bg-background-primary/50 px-3 py-1 rounded-full border border-white/10">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}