import { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, AlertTriangle, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | A-List Hub",
  description:
    "Terms of Service for A-List Hub — your rights and responsibilities when using our Narcos Life tools and platform.",
  keywords: "terms of service, legal, user agreement, A-List Hub, narcos life",
  openGraph: {
    title: "Terms of Service | A-List Hub",
    description:
      "Terms of Service for A-List Hub — your rights and responsibilities when using our platform.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "August 28, 2025";

  const sections = [
    {
      title: "1) Definitions",
      content: [
        "“Service” means the A-List Hub website, applications, tools, features, content, and related services we provide.",
        "“We,” “us,” and “our” mean A-List Hub.",
        "“You” and “your” mean the person or entity accessing or using the Service.",
        "“Account” means a registered profile tied to your Discord identity.",
        "“Content” means all text, graphics, software, data, and materials available on or through the Service.",
        "“User Content” means any content you submit, post, upload, or otherwise make available through the Service.",
        "“Whitelist” means our access-control program that unlocks designated or premium features for approved users.",
        "“Narcos Life” refers to the game server and its community; A-List Hub is not affiliated with Narcos Life unless explicitly stated otherwise.",
      ],
    },
    {
      title: "2) Acceptance of Terms",
      content: [
        "By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must not use the Service.",
        "These Terms apply to all users of the Service, including whitelisted members and visitors.",
      ],
    },
    {
      title: "3) Eligibility & Age Requirements",
      content: [
        "You must be at least 13 years old to use the Service and able to form a binding contract under applicable law.",
        "You are responsible for ensuring your use of the Service complies with all laws, rules, and regulations applicable to you.",
      ],
    },
    {
      title: "4) Description of the Service",
      content: [
        "A-List Hub provides tools, calculators, and community features designed for Narcos Life players.",
        "Our services may include, without limitation: calculators, license information, vehicle data, and community or informational features.",
      ],
    },
    {
      title: "5) Accounts, Verification & Whitelist",
      content: [
        "Certain features require an Account and successful Discord verification. Premium features may require whitelist approval.",
        "You are responsible for maintaining the confidentiality of your Account and for all activity that occurs under it.",
        "Account sharing is prohibited. If you believe your Account is compromised, notify us promptly via our official Discord support channels.",
      ],
    },
    {
      title: "6) Acceptable Use",
      content: [
        "You agree not to misuse the Service. Prohibited conduct includes, without limitation:",
        "- Scraping, crawling, or harvesting data without our prior written permission.",
        "- Excessive automated requests or using bots to interact with the Service, except as expressly permitted.",
        "- Reverse engineering, decompiling, or attempting to extract source code except where allowed by law.",
        "- Circumventing rate limits, security measures, or access controls (including Whitelist restrictions).",
        "- Attempting lateral movement, privilege escalation, or unauthorized access to data or systems.",
        "- Uploading or distributing malware, spyware, or other malicious code.",
        "- Doxxing, harassment, threats, impersonation, or other abusive behavior.",
        "- Infringing intellectual property rights or misusing confidential information.",
        "- Selling, renting, leasing, sublicensing, or otherwise transferring access to the Service without permission.",
      ],
    },
    {
      title: "7) User Content & License",
      content: [
        "You retain ownership of your User Content. By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, and otherwise use it solely as necessary to operate, improve, and provide the Service.",
        "This license ends when you remove your User Content from the Service, except that the license survives for a reasonable period for backup, archival, or legal compliance purposes.",
      ],
    },
    {
      title: "8) Third-Party Services & Links",
      content: [
        "The Service integrates with or relies on third-party services (e.g., Discord for authentication, Vercel for hosting, Supabase for data). Those services are governed by their own terms and privacy policies.",
        "We do not control and are not responsible for third-party services, their availability, or their policies. Your use of third-party services is at your own risk.",
      ],
    },
    {
      title: "9) Privacy, Security & Incorporated Policies",
      content: [
        "Your use of the Service is also subject to our Privacy Policy and our Security page. These documents are incorporated by reference into these Terms.",
        "Please review those pages to understand how we collect, use, and protect information and how we secure the platform.",
      ],
    },
    {
      title: "10) Service Changes & Availability",
      content: [
        "We may add, modify, or discontinue any feature or the entire Service at our reasonable discretion, with or without notice where permitted by law.",
        "Where feasible, we will provide reasonable notice of material changes or scheduled maintenance that significantly affects availability.",
      ],
    },
    {
      title: "11) Beta & Experimental Features",
      content: [
        "We may offer beta or experimental features to limited or designated users. Such features are provided “as is,” may contain bugs or errors, and may be changed, suspended, or discontinued at any time.",
        "We may collect feedback about beta features; by providing feedback, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use it without obligation to you.",
      ],
    },
    {
      title: "12) Content & Intellectual Property",
      content: [
        "All Content provided by us on or through the Service (including text, graphics, logos, and software) is owned by us or our licensors and protected by intellectual property laws.",
        "Except as expressly permitted, you may not reproduce, distribute, or create derivative works from our Content without our prior written permission.",
      ],
    },
    {
      title: "13) No Affiliation / Fair-Use (Narcos Life)",
      content: [
        "A-List Hub is an independent platform and is not affiliated with, endorsed by, or sponsored by Narcos Life unless expressly stated.",
        "Any references to Narcos Life are for identification and descriptive purposes only and do not imply endorsement or association.",
      ],
    },
    {
      title: "14) Disclaimers & Limitations",
      content: [
        "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        "We do not guarantee the accuracy, completeness, or timeliness of information provided via the Service. Your use of the Service is at your own risk.",
        "To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or exemplary damages arising from or related to your use of the Service.",
      ],
    },
    {
      title: "15) Indemnification",
      content: [
        "You agree to protect and not hold A-List Hub, its owner (Levy), or any staff or volunteers responsible for any claims, damages, costs, or legal fees that result from:",
        "- how you use or misuse the Service,",
        "- any content you create or share through the Service, or",
        "- if you break these Terms or any applicable laws while using the Service.",
      ],
    },
    {
      title: "16) Export Controls & Sanctions",
      content: [
        "You may not use the Service if you are located in, or are a resident of, a country or region subject to comprehensive sanctions, or if you are on a U.S. or other applicable government sanctions list.",
        "You agree to comply with all applicable export control and sanctions laws in connection with your use of the Service.",
      ],
    },
    {
      title: "17) Suspension & Termination",
      content: [
        "We may, at our reasonable discretion, suspend or terminate your access to the Service, with or without notice where permitted by law, including for suspected violations of these Terms or applicable law.",
        "Upon suspension or termination, your right to use the Service ceases immediately. Certain provisions of these Terms will survive (e.g., IP ownership, indemnification, disclaimers, limitations of liability, governing law).",
        "Appeals: If you believe your Account was suspended or terminated in error, you may contact us via our official Discord support channels for review. We aim to review appeals in good faith but are not obligated to reinstate access.",
      ],
    },
    {
      title: "18) Governing Law & Venue",
      content: [
        "These Terms and any dispute or claim arising out of or related to them or the Service are governed by the laws of the State of Washington, U.S.A., without regard to conflict-of-laws principles.",
        "You agree to the exclusive jurisdiction and venue of the state and federal courts located in King County, Washington, for any dispute that is not subject to arbitration or other dispute-resolution mechanism agreed by the parties.",
      ],
    },
    {
      title: "19) Force Majeure",
      content: [
        "We will not be liable for any delay or failure to perform due to causes beyond our reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, governmental actions, utility or telecommunications outages, or failures of third-party services or networks.",
      ],
    },
    {
      title: "20) Changes to These Terms",
      content: [
        "We may update these Terms from time to time. Changes are effective upon posting unless otherwise specified.",
        "Where feasible, we will provide reasonable notice of material updates. Your continued use of the Service after updates constitutes acceptance of the revised Terms.",
        "We encourage you to review these Terms periodically.",
      ],
    },
    {
      title: "21) Contact Information",
      content: [
        "If you have questions about these Terms, please contact us through our official Discord server.",
        "We aim to respond to inquiries within a reasonable timeframe during normal operations.",
      ],
    },
  ];

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
            Please read these Terms of Service carefully before using A-List
            Hub.
          </p>
          <p className="text-text-secondary">Last Updated: {lastUpdated}</p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-400 font-semibold mb-2">
                Important Notice
              </h3>
              <p className="text-text-secondary leading-relaxed">
                By using A-List Hub, you agree to these Terms. If you do not
                agree with any part, you must not use the Service. These Terms
                may be updated periodically; continued use after updates
                constitutes acceptance of the changes.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div
                key={index}
                className="border-b border-white/10 pb-8 last:border-b-0 last:pb-0"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-text-secondary leading-relaxed"
                    >
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
              Understand the security measures we implement to protect our
              platform.
            </p>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions About These Terms?
          </h2>
          <p className="text-text-secondary mb-6">
            If you have any questions about these Terms of Service, please
            contact us through our Discord server.
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
  );
}
