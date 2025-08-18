"use client"

import { motion } from "framer-motion"
import { 
  Home, 
  DollarSign, 
  ShoppingBag, 
  Car, 
  Hammer, 
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  MapPin,
  Coins,
  Package,
  Shield,
  Target
} from "lucide-react"

// Custom Pickaxe icon component
const PickaxeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999" />
    <path d="M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024" />
    <path d="M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069" />
    <path d="M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z" />
  </svg>
)

export default function StarterGuidePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const steps = [
    {
      id: 1,
      title: "Secure Your Home Base",
      icon: Home,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      content: [
        "Spawn in Lakeside City",
        "Head to the glass building right next to spawn",
        "Walk up to the elevators → claim and enter your free apartment",
        "Inside, look for the wooden key rack on the wall → claim your free storage locker",
        "This is now your safe place to store items and get started"
      ]
    },
    {
      id: 2,
      title: "Get Starter Cash",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      content: [
        "Exit the apartment building and head to an ATM near the clothing store / general store",
        "Withdraw around $500"
      ],
      warning: "Any cash you carry can be dropped if you die or stolen if criminals zip-tie and search you!"
    },
    {
      id: 3,
      title: "Basic Supplies",
      icon: ShoppingBag,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      content: [
        {
          location: "Clothing Store",
          items: ["Bergen backpack ($100)"]
        },
        {
          location: "General Store",
          items: [
            "1x Pickaxe ($100)",
            "5x Burgers ($10 each)",
            "5x Sodas ($10 each)"
          ]
        }
      ],
      tips: [
        "Food & drink are consumed through your inventory",
        "You'll need the pickaxe anytime you're mining"
      ]
    },
    {
      id: 4,
      title: "Your First Vehicle",
      icon: Car,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      content: [
        {
          option: "Budget Starter",
          cost: "$1,200",
          details: [
            "Use the ATM inside to withdraw $1,200",
            "Buy an S105 Sarka (Red Car) → can hold 4–5 ore"
          ]
        },
        {
          option: "Bigger Investment",
          cost: "$2,000",
          details: [
            "Withdraw $2,000",
            "Buy the S1203 Minibus → can hold 10 ore, giving you nearly double the carrying capacity for early mining runs"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Mining & Processing",
      icon: PickaxeIcon,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      content: [
        "Head to the Coal Mine and begin mining",
        "Once you've filled your inventory/car, sell your coal at the Coal Trader in Lakeside City"
      ],
      highlight: "Coal requires no processing license – you can simply mine → sell/craft",
      licenses: [
        { material: "Sand", cost: "$5,000", icon: "🪨" },
        { material: "Copper", cost: "$10,000", icon: "🪙" },
        { material: "Iron", cost: "$15,000", icon: "⛓️" },
        { material: "Cotton", cost: "$20,000", icon: "🌿" },
        { material: "Diamond", cost: "$50,000", icon: "💎" },
        { material: "Rebel Outpost / Black Market Buyers", cost: "$50,000", icon: "🏴" }
      ]
    },
    {
      id: 6,
      title: "Long-Term Goals",
      icon: Target,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      content: [
        "Your first big milestone is the Haul Hogan truck ($40,000)",
        "This lets you carry more ore → make money much faster",
        "It's also the first step toward the crafting system"
      ],
      crafting: {
        bench: "$10,000 (furniture shop for houses)",
        upgrade: "$75,000 (for your free apartment)",
        benefit: "Crafting unlocks advanced RP opportunities and makes it much easier to generate cash on demand"
      }
    },
    {
      id: 7,
      title: "Firearms & RP Rules",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      content: [
        {
          text: "Read & understand the server rules fully > ",
          link: "https://narcosliferp.com/rules/",
          linkText: "View Server Rules"
        },
        "Gunplay RP here may differ from other servers you've played on"
      ],
      critical: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-400/4 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Narcos Life Roleplay
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
            Beginner's Guide
          </h2>
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-text-secondary text-lg leading-relaxed mb-4">
              Welcome to Narcos Life Roleplay! You're about to start your story in <span className="text-purple-400 font-semibold">Lakeside City</span> with <span className="text-green-400 font-bold">$5,000</span> in your bank account.
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="text-purple-400">Written by:</span>
                <span className="font-medium text-white">Hamish Macbeth</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">Last Updated:</span>
                <span className="font-medium text-white">{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps Container */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={fadeInUp}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`${step.bgColor} p-3 rounded-xl`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                      Step {step.id}
                    </span>
                    {step.critical && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-semibold">IMPORTANT</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{step.title}</h3>
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                {/* Regular content */}
                {Array.isArray(step.content) && step.content.every(item => typeof item === 'string') && (
                  <ul className="space-y-3">
                    {(step.content as string[]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Content with links (Step 7) */}
                {step.id === 7 && (
                  <ul className="space-y-3">
                    {(step.content as any[]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-text-secondary">
                          {typeof item === 'string' ? (
                            item
                          ) : (
                            <div className="space-y-2">
                              <span>{item.text}</span>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium underline underline-offset-2"
                              >
                                {item.linkText}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Shopping content */}
                {step.id === 3 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(step.content as any[]).map((shop, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          <h4 className="font-semibold text-white">{shop.location}</h4>
                        </div>
                        <ul className="space-y-2">
                          {shop.items.map((item: string, itemIdx: number) => (
                            <li key={itemIdx} className="flex items-center gap-2 text-text-secondary">
                              <Package className="w-4 h-4 text-orange-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle options */}
                {step.id === 4 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(step.content as any[]).map((option, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{option.option}</h4>
                          <span className="text-green-400 font-bold">{option.cost}</span>
                        </div>
                        <ul className="space-y-2">
                          {option.details.map((detail: string, detailIdx: number) => (
                            <li key={detailIdx} className="flex items-start gap-2 text-text-secondary text-sm">
                              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Seatbelt Warning */}
{step.id === 4 && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-yellow-400 font-semibold text-sm mb-1">🚗 Seatbelt Safety</div>
        <p className="text-yellow-300 text-sm mb-2">Always wear your seatbelt when driving to prevent injury during crashes!</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-medium">PC:</span>
            <span className="text-white bg-white/10 px-2 py-1 rounded">B Key</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-medium">Xbox:</span>
            <span className="text-white bg-white/10 px-2 py-1 rounded">Y Button</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-medium">PlayStation:</span>
            <span className="text-white bg-white/10 px-2 py-1 rounded">Triangle</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

                {/* Warning */}
                {step.warning && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-red-400 font-semibold text-sm mb-1">⚠️ Warning</div>
                        <p className="text-red-300 text-sm">{step.warning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {step.tips && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-blue-400 font-semibold text-sm mb-2">💡 Tips</div>
                    <ul className="space-y-1">
                      {step.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="text-blue-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Highlight */}
                {step.highlight && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-green-400 font-semibold text-sm mb-1">✅ Quick Start</div>
                        <p className="text-green-300 text-sm">{step.highlight}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Licenses */}
                {step.licenses && (
                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-3">Other Materials Require Licenses:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {step.licenses.map((license, licenseIdx) => (
                        <div key={licenseIdx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{license.icon}</span>
                            <span className="text-white font-medium text-sm">{license.material}</span>
                          </div>
                          <div className="text-green-400 font-semibold text-sm">{license.cost}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-text-secondary text-sm mt-3">
                      💡 All license prices are always listed in the A-List Narcos Hub for quick reference.
                    </p>
                  </div>
                )}

                {/* Crafting System */}
                {step.crafting && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-white font-semibold">Crafting System</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">Crafting Bench</span>
                        </div>
                        <p className="text-orange-400 font-semibold">{step.crafting.bench}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">Bench Upgrade</span>
                        </div>
                        <p className="text-purple-400 font-semibold">{step.crafting.upgrade}</p>
                      </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-300 text-sm">{step.crafting.benefit}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 glass rounded-2xl p-6 border border-red-500/30"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-2">⚠️ DISCLAIMER</h3>
              <p className="text-red-300 mb-3">
                All information in this guide is subject to change.
              </p>
              <p className="text-text-secondary text-sm">
                Narcos Life Roleplay is currently in early <span className="text-red-400 font-semibold">ALPHA testing</span> – features, prices, and mechanics may be updated at any time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/"
              className="glass px-6 py-3 rounded-xl text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all duration-300 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Hub
            </a>
            <a
              href="/whitelist"
              className="glass px-6 py-3 rounded-xl text-green-400 hover:text-white hover:bg-green-500/20 transition-all duration-300 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Get Whitelisted
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}