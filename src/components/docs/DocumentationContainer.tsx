'use client'

import { DocumentationSection } from './DocumentationSection'
import { FAQSection } from './FAQSection'

// Define section data inside the client component to avoid passing functions
const documentationData = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of using A-List Hub",
    iconName: "BookOpen",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    items: [
      {
        title: "Creating Your Account",
        content: `Getting started with A-List Hub is simple and secure. Here's how to create your account:

**Step 1: Discord Authentication**
- Click "Login with Discord" on the homepage
- Authorize A-List Hub to access your Discord profile
- Your account is automatically created using your Discord identity

**Step 2: Profile Setup**
- Your Discord username and avatar are imported automatically
- Review your profile information in the Profile section
- All data is securely stored and encrypted

**What You Get:**
- Instant access to basic tools
- Community Discord server access
- Personalized experience across all tools

**Security Note:** We only access your basic Discord profile information (username, avatar, ID, email). We never access any other Discord account data.`
      },
      {
        title: "Discord Integration",
        content: `A-List Hub integrates seamlessly with Discord to provide the best experience:

**Authentication Benefits:**
- Single sign-on with your Discord account
- No need to remember separate passwords
- Secure OAuth 2.0 implementation
- Instant account verification

**Community Features:**
- Automatic Discord server integration
- Role-based access control
- Real-time notifications
- Community events and updates

**Privacy & Security:**
- End-to-end encrypted data transmission
- No storage of Discord passwords
- Minimal data collection (username, ID, email, avatar only)
- Full compliance with Discord's Terms of Service

**Troubleshooting:**
If you experience login issues:
1. Clear your browser cache and cookies
2. Ensure your Discord account has a verified email address
3. Try logging out of Discord and back in
4. Contact support if issues persist`
      },
      {
        title: "Understanding the Whitelist",
        content: `Our whitelist system ensures quality and maintains a premium experience:

**What is the Whitelist?**
The whitelist is our premium system that grants access to premium features and tools. It helps us maintain a high-quality community and ensure our advanced features are used responsibly.

**How to Get Whitelisted:**
1. **Join our Discord Server** - Active community participation is essential
2. **Login with Discord** - Login to the A-List Hub with your Discord account
3. **Submit Whitelist Request** - Fill out and submit the whitelist request form
4. **Application Review** - Our team reviews your request and messages you via Discord DMs

**Whitelist Benefits:**
- Access to all premium calculators and tools
- Community recognition and roles

**Trial System:**
New users may request temporary trial access to experience premium features before full whitelist approval.`
      },
      {
        title: "First Steps Guide",
        content: `Once you're set up, here's how to make the most of A-List Hub:

**1. Explore the Dashboard**
- Familiarize yourself with the navigation menu
- Check out your profile
- Review available tools and features

**2. Join the Community**
- Connect with our Discord server
- Introduce yourself to other members
- Participate in community discussions

**3. Try the Tools**
- Start with the calculators
- Experiment with different features

**Pro Tips:**
- Join community events for exclusive content
- Follow our Discord announcements for updates
- Provide feedback to help us improve`
      }
    ]
  },
  {
    id: "tools-features",
    title: "Tools & Features",
    description: "Comprehensive guide to all available tools",
    iconName: "Zap",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    items: [
      {
        title: "Crafting Calculator",
        content: `Our advanced crafting calculator helps you plan and optimize your crafting operations:

**Key Features:**
- Complete database of all craftable items
- Material requirement calculations
- Quantity scaling for bulk operations
- Crafting time and XP estimates
- Optimal resource planning

**How to Use:**
1. Select your desired category (Weapons, Materials, etc.)
2. Choose the specific item you want to craft
3. Enter the quantity you need
4. Review the complete material breakdown
5. Plan your resource gathering accordingly

**Advanced Features:**
- Material chain calculations (raw materials to finished products)
- Crafting level requirements
- Time optimization suggestions

**Categories Available:**
- Weapon Parts
- Rifles
- Handguns
- Magazines
- Vests
- Clothing 
- Backpacks
- Raw Materials & Components

**Pro Tips:**
- Always check material chains for efficiency
- Plan bulk crafting to optimize time
- Track your progress with the built-in calculator`
      },
      {
        title: "Vehicle Information System",
        content: `Complete vehicle database with detailed specifications:

**Vehicle Categories:**
- Cars
- Trucks

**Detailed Information:**
- Performance specifications (speed, acceleration, handling)
- Price ranges

**Updates:**
Our vehicle database is constantly updated with new additions, balance changes, and community feedback to ensure accuracy and completeness.`
      },
    ]
  },
  {
    id: "community",
    title: "Community & Support",
    description: "Connect with other players and get help",
    iconName: "Users",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    items: [
      {
        title: "Discord Community Guidelines",
        content: `Our Discord community is the heart of A-List Hub. Here are our guidelines:

**Core Principles:**
- Respect all community members
- Keep discussions relevant and constructive
- No spam, self-promotion, or excessive off-topic content
- Follow Discord's Terms of Service
- Maintain a positive and welcoming environment

**Channel Structure:**
- **#general** - Main community discussion
- **#support** - Technical help and questions
- **#feedback** - Suggestions and feature requests
- **#announcements** - Important updates and news
- **#tools-discussion** - Calculator and tool discussions

**Moderation:**
- Warnings for minor infractions
- Temporary mutes for repeated violations
- Kicks for serious violations
- Permanent bans for extreme cases
- Appeal process available for all actions

**Reporting:**
- Use Discord's built-in reporting system
- Contact moderators directly for urgent issues
- Provide evidence when possible
- Follow up on your reports if necessary

**Community Events:**
- Regular community challenges
- Tool showcases and tutorials
- Q&A sessions with developers
- Beta testing opportunities`
      },
      {
        title: "Getting Support",
        content: `We're here to help! Here's how to get the support you need:

**Support Channels:**
1. **Discord Community** - Fastest response for general questions
2. **Support Tickets** - For technical issues and account problems
3. **Documentation** - Comprehensive guides and tutorials
4. **FAQ Section** - Common questions and answers

**Before Requesting Support:**
- Check this documentation first
- Search Discord for similar questions
- Try basic troubleshooting steps
- Gather relevant error messages or screenshots

**What to Include in Support Requests:**
- Clear description of the issue
- Steps to reproduce the problem
- Screenshots or error messages
- Your browser and operating system
- When the issue first occurred

**Response Times:**
- Discord community: Usually within 1-2 hours
- Support tickets: 24-48 hours
- Complex technical issues: 3-5 business days
- Feature requests: Reviewed weekly

**Emergency Support:**
For critical issues affecting platform availability or security, contact administrators directly through Discord with @Admin ping.`
      },
      {
        title: "Feature Requests & Feedback",
        content: `Your feedback drives our development! Here's how to contribute:

**Submitting Feature Requests:**
1. Check if the feature already exists or is planned
2. Describe the feature clearly and in detail
3. Explain the use case and benefits
4. Provide examples or mockups if possible
5. Submit through Discord #feedback channel or support ticket

**Feedback Categories:**
- **New Features** - Completely new functionality
- **Improvements** - Enhancements to existing features
- **Bug Reports** - Issues and problems
- **UI/UX** - Design and usability suggestions
- **Performance** - Speed and optimization requests

**Development Process:**
1. **Collection** - We gather all feedback regularly
2. **Review** - Team evaluates feasibility and impact
3. **Planning** - Approved features enter development roadmap
4. **Development** - Features are built and tested
5. **Release** - New features deployed with announcements

**Community Voting:**
- Popular requests get community voting opportunities
- High-voted features receive priority consideration
- Community involvement in feature prioritization
- Regular polls and surveys for direction

**Recognition:**
Contributors of valuable feedback and suggestions receive community recognition and special roles.`
      },
      {
        title: "Reporting Issues & Bugs",
        content: `Help us maintain a quality platform by reporting issues effectively:

**Types of Issues:**
- **Critical Bugs** - Platform unavailable or major functionality broken
- **Standard Bugs** - Features not working as expected
- **Visual Issues** - Display problems or UI glitches
- **Performance Issues** - Slow loading or responsiveness problems
- **Data Issues** - Incorrect calculations or information

**Reporting Process:**
1. **Immediate Action** - Take screenshots of the issue
2. **Reproduce** - Try to recreate the problem
3. **Document** - Note exact steps that caused the issue
4. **Report** - Submit through Discord #support or support ticket
5. **Follow Up** - Provide additional information if requested

**What to Include:**
- Detailed description of the problem
- Step-by-step reproduction instructions
- Screenshots or screen recordings
- Browser/device information
- Time and date when issue occurred
- Any error messages received

**Bug Tracking:**
- All bugs are tracked in our internal system
- Status updates provided for major issues
- Community notifications for widespread problems
- Regular bug fix releases and updates

**Rewards:**
Users who report significant bugs or security issues may receive recognition and rewards within the community.`
      }
    ]
  },
  {
    id: "security-privacy",
    title: "Security & Privacy",
    description: "Understanding our security measures and your privacy",
    iconName: "Shield",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    items: [
      {
        title: "Data Protection & Privacy",
        content: `Your privacy and data security are our top priorities:

**Data Collection:**
We collect only essential information needed to provide our services:
- Discord profile information (username, ID, avatar)
- Usage analytics for platform improvement
- Preferences and settings
- Communication logs for support purposes

**Data Storage:**
- All data encrypted in transit and at rest
- Secure cloud infrastructure with enterprise-grade security
- Regular security audits and penetration testing
- Compliant with GDPR and other privacy regulations

**Data Usage:**
- Service provision and platform functionality
- Customer support and troubleshooting
- Platform analytics and improvement
- Security monitoring and fraud prevention

**Your Rights:**
- Right to access your personal data
- Right to correct inaccurate information
- Right to delete your account and data
- Right to data portability
- Right to object to certain processing

**Data Retention:**
- Account data retained while account is active
- Analytics data retained for 2 years maximum
- Support logs retained for 1 year
- Immediate deletion upon account closure request

**Contact:**
For privacy concerns or data requests, contact our privacy team through Discord or support ticket.`
      },
      {
        title: "Account Security Best Practices",
        content: `Protect your account with these security best practices:

**Discord Account Security:**
- Enable Two-Factor Authentication (2FA) on Discord
- Use a strong, unique password for Discord
- Regularly review your authorized applications
- Keep your Discord app updated
- Be cautious with suspicious links or DMs

**Platform Security:**
- Log out when using public computers
- Keep your browser updated with latest security patches
- Be cautious when sharing screenshots (hide sensitive data)
- Report suspicious activity immediately
- Don't share your account with others

**Phishing Protection:**
- Always verify you're on the official A-List Hub domain
- Never enter your Discord credentials on suspicious sites
- Be wary of fake Discord bots or impersonators
- Official communication comes only from verified sources
- When in doubt, contact support directly

**Suspicious Activity:**
Signs that your account may be compromised:
- Unauthorized login notifications
- Changes you didn't make
- Unexpected Discord authorizations
- Unusual activity in your profile

**If Compromised:**
1. Immediately change your Discord password
2. Revoke A-List Hub authorization in Discord settings
3. Re-authorize with Discord using new credentials
4. Contact our support team immediately
5. Review all account activity`
      },
      {
        title: "Platform Security Measures",
        content: `Our comprehensive security infrastructure protects your data:

**Infrastructure Security:**
- Enterprise-grade cloud hosting with 99.9% uptime
- Distributed denial-of-service (DDoS) protection
- Web Application Firewall (WAF)
- Intrusion detection and prevention systems
- 24/7 security monitoring and incident response

**Application Security:**
- Secure coding practices and regular code reviews
- Input validation and SQL injection prevention
- Cross-site scripting (XSS) protection
- Cross-site request forgery (CSRF) protection
- Regular security vulnerability assessments

**Data Encryption:**
- TLS 1.3 encryption for all data in transit
- AES-256 encryption for data at rest
- Encrypted database storage
- Secure key management systems
- End-to-end encryption for sensitive operations

**Access Controls:**
- Role-based access control (RBAC)
- Multi-factor authentication for admin access
- Principle of least privilege
- Regular access reviews and audits
- Automated access monitoring

**Compliance & Auditing:**
- Regular third-party security audits
- Compliance with industry standards
- Detailed audit logs and monitoring
- Incident response procedures
- Business continuity and disaster recovery plans

**Transparency:**
We maintain transparency about our security practices while protecting sensitive implementation details.`
      },
      {
        title: "Privacy Controls & Settings",
        content: `Take control of your privacy with our comprehensive settings:

**Profile Privacy:**
- Control visibility of your profile information
- Manage what data is shared with other users
- Configure Discord integration level
- Set communication preferences
- Control data sharing with third parties

**Data Management:**
- Download your personal data at any time
- Request corrections to inaccurate information
- Delete specific data categories
- Export your usage history and statistics
- Manage data retention preferences

**Communication Controls:**
- Email notification preferences
- Discord notification settings
- Marketing communication opt-out
- Support communication preferences
- Community interaction controls

**Analytics Opt-Out:**
- Disable usage analytics collection
- Opt out of performance monitoring
- Control error reporting
- Manage behavioral analytics
- Set cookie preferences

**Account Deletion:**
- Complete account deletion process
- Data deletion timeline and procedures
- What data is retained and why
- Recovery period and options
- Confirmation and verification steps

**Regular Privacy Reviews:**
We recommend reviewing your privacy settings regularly and staying informed about updates to our privacy policy and terms of service.`
      }
    ]
  }
]

const faqData = [
  {
    question: "What is A-List Hub and how does it work?",
    answer: "A-List Hub is a premium platform providing advanced tools and resources for Narcos Life players. We offer calculators, guides, and community features to enhance your experience. The platform integrates with Discord for authentication and community features, providing a seamless and secure experience."
  },
  {
    question: "How do I get whitelisted for premium features?",
    answer: "To get whitelisted, you need an active Discord account, must join our Discord server, fill out the whitelist request form, and get verified by an A-List Hub administrator. The process ensures we maintain a high-quality community. Active participation in our Discord community and following community guidelines significantly improve your chances of approval."
  },
  {
    question: "Is A-List Hub free to use?",
    answer: "A-List Hub offers both free and premium features. Basic access is available to all users, premium tools and advanced features are available for whitelisted users. We also offer trial periods for new users to experience premium features."
  },
  {
    question: "How do I report bugs or technical issues?",
    answer: "You can report bugs or issues through our Discord server in the #support channel. Our team actively monitors these channels and will respond promptly. Please include as much detail as possible, including screenshots and steps to reproduce the issue."
  },
  {
    question: "Can I contribute to A-List Hub development?",
    answer: "Yes! We welcome community contributions including feedback, feature suggestions, bug reports, and beta testing. Join our Discord community to get involved in discussions about future development. Valuable contributors may receive recognition and special roles within the community."
  },
  {
    question: "How is my data protected and what do you collect?",
    answer: "We prioritize your privacy and security. We only collect essential information like your Discord profile data, usage analytics, and preferences. All data is encrypted in transit and at rest, and we comply with GDPR and other privacy regulations. You have full control over your data and can request deletion at any time."
  },
  {
    question: "What should I do if I can't log in?",
    answer: "If you're experiencing login issues, try clearing your browser cache and cookies, ensure your Discord account has a verified email address , and verify you're using the correct Discord account. If problems persist, contact our support team through Discord with details about the issue."
  },
  {
    question: "How often are the tools and databases updated?",
    answer: "Our tools and databases are updated regularly to ensure accuracy and completeness. Crafting recipes and prices are updated as Narcos server changes occur, typically within 24-48 hours of official updates. Community feedback helps us identify areas that need updates quickly."
  }
]

export function DocumentationContainer() {
  return (
    <>
      {/* Documentation Sections with Accordions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {documentationData.map((section) => (
          <DocumentationSection
            key={section.id}
            section={section}
          />
        ))}
      </div>

      {/* FAQ Section */}
      <FAQSection faqs={faqData} />
    </>
  )
}