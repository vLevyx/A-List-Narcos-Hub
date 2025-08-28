"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Car,
  Fish,
  Hammer, 
  Mountain, 
  Wrench, 
  Shield, 
  Shirt, 
  Gem, 
  Eye,
  TrendingUp,
  Clock,
  Star,
  AlertTriangle,
  Info,
  DollarSign,
  Zap,
  ShoppingCart,
  Award,
  Settings,
  Plus,
  Target,
  Skull,
  Truck,
  CircleDot
} from "lucide-react";

// Custom Pickaxe Icon Component
const PickaxeIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3L11 9.999"/>
    <path d="M15.973 4.027A13 13 0 0 0 5.902 2.373c-1.398.342-1.092 2.158.277 2.601a19.9 19.9 0 0 1 5.822 3.024"/>
    <path d="M16.001 11.999a19.9 19.9 0 0 1 3.024 5.824c.444 1.369 2.26 1.676 2.603.278A13 13 0 0 0 20 8.069"/>
    <path d="M18.352 3.352a1.205 1.205 0 0 0-1.704 0l-5.296 5.296a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l5.296-5.296a1.205 1.205 0 0 0 0-1.704z"/>
  </svg>
);

// Custom ID Card Icon Component
const IdCardIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 10h2"/>
    <path d="M16 14h2"/>
    <path d="M6.17 15a3 3 0 0 1 5.66 0"/>
    <circle cx="9" cy="11" r="2"/>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
  </svg>
);

// ===== TYPE DEFINITIONS =====

interface License {
  id: string;
  name: string;
  price: number | "Free";
  sellPrice: number;
  icon: React.ComponentType<any>;
  description: string;
  category: "basic" | "intermediate" | "advanced" | "special";
  rarity: "common" | "uncommon" | "rare" | "legendary";
  isRecommended?: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "basic" | "transport" | "rally" | "premium";
  icon: React.ComponentType<any>;
}

interface FishItem {
  id: string;
  name: string;
  price: number;
  type: "equipment" | "fish" | "animal";
  description: string;
  icon: React.ComponentType<any>;
  tier?: number;
}

interface RebelItem {
  id: string;
  name: string;
  price?: number;
  sellPrice?: number;
  icon: React.ComponentType<any>;
  description: string;
  category: "weapon" | "equipment" | "explosive" | "accessory";
  isSelectable?: boolean;
}

type TabType = "licenses" | "vehicles" | "fishing" | "rebel" | "more";

// ===== DATA DEFINITIONS =====

const licenses: License[] = [
  {
    id: "coal",
    name: "Coal License",
    price: "Free",
    sellPrice: 32,
    icon: PickaxeIcon,
    description: "Start your mining journey with basic coal extraction. Mine it, sell it, or use it in crafting. (Note: Coal cannot be processed further.)",
    category: "basic",
    rarity: "common",
    isRecommended: true
  },
  {
    id: "sand",
    name: "Sand License",
    price: 5000,
    sellPrice: 70,
    icon: Mountain,
    description: "Extract valuable sand resources for construction and crafting. Produces glass panes.",
    category: "basic",
    rarity: "common"
  },
  {
    id: "copper",
    name: "Copper License",
    price: 10000,
    sellPrice: 90,
    icon: Wrench,
    description: "Mine copper ore for advanced crafting and electrical components. Produces copper bars.",
    category: "intermediate",
    rarity: "uncommon"
  },
  {
    id: "iron",
    name: "Iron License",
    price: 15000,
    sellPrice: 120,
    icon: Shield,
    description: "Access iron deposits for weapons, tools, and construction. Produces iron bars.",
    category: "intermediate",
    rarity: "uncommon"
  },
  {
    id: "cotton",
    name: "Cotton License",
    price: 20000,
    sellPrice: 50,
    icon: Shirt,
    description: "Cultivate cotton for textile production and clothing manufacturing. Produces cloth sheets.",
    category: "intermediate",
    rarity: "uncommon"
  },
  {
    id: "diamond",
    name: "Diamond License",
    price: 50000,
    sellPrice: 195,
    icon: Gem,
    description: "Mine the most precious gems for luxury crafting and trading.",
    category: "advanced",
    rarity: "rare"
  },
  {
    id: "black-market",
    name: "Black Market License",
    price: 50000,
    sellPrice: 0,
    icon: Eye,
    description: "Access exclusive underground trading networks and illegal items. Unlocks Rebel Outpost.",
    category: "special",
    rarity: "legendary"
  }
];

const vehicles: Vehicle[] = [
  {
    id: "s105-car",
    name: "S105 Car",
    price: 1200,
    description: "Basic transportation vehicle for everyday use.",
    category: "basic",
    icon: Car
  },
  {
    id: "s1203-minibus",
    name: "S1203 Minibus",
    price: 2000,
    description: "Larger capacity vehicle for group transportation.",
    category: "transport",
    icon: Car
  },
  {
    id: "s105-rally",
    name: "S105 Rally",
    price: 136000,
    description: "High-performance rally car for racing and speed.",
    category: "rally",
    icon: Zap
  },
  {
    id: "hual-hogan",
    name: "Hual Hogan",
    price: 40000,
    description: "Heavy-duty vehicle for cargo and industrial operations.",
    category: "transport",
    icon: Truck
  },
  {
    id: "toesucka",
    name: "Toesucka",
    price: 240000,
    description: "Premium luxury vehicle with advanced features.",
    category: "premium",
    icon: Star
  },
  {
    id: "tuskang",
    name: "Tuskang",
    price: 800000,
    description: "Top-tier elite vehicle for the most discerning operators.",
    category: "premium",
    icon: Award
  },
  {
    id: "lumperwhini",
    name: "Lumperwhini",
    price: 1200000,
    description: "Ultra-premium exotic SUV with unmatched luxury and performance.",
    category: "premium",
    icon: Star
  }
];

const fishingItems: FishItem[] = [
  {
    id: "fishing-rod-t1",
    name: "Fishing Rod T1",
    price: 100,
    type: "equipment",
    description: "Basic fishing rod for beginners.",
    icon: Wrench,
    tier: 1
  },
  {
    id: "fishing-rod-t2",
    name: "Fishing Rod T2",
    price: 2000,
    type: "equipment",
    description: "Improved fishing rod with better catch rates.",
    icon: Wrench,
    tier: 2
  },
  {
    id: "fishing-rod-t3",
    name: "Fishing Rod T3",
    price: 20000,
    type: "equipment",
    description: "Professional fishing rod for expert anglers.",
    icon: Wrench,
    tier: 3
  },
  {
    id: "boots",
    name: "Boots",
    price: 10,
    type: "fish",
    description: "Catchable item - Old boots found in the water.",
    icon: CircleDot
  },
  {
    id: "carp-fish",
    name: "Carp Fish",
    price: 65,
    type: "fish",
    description: "Common freshwater fish, good for beginners.",
    icon: Fish
  },
  {
    id: "tuna-fish",
    name: "Tuna Fish",
    price: 75,
    type: "fish",
    description: "Valuable ocean fish with high market demand.",
    icon: Fish
  },
  {
    id: "shiny-fish",
    name: "Shiny Fish",
    price: 150,
    type: "fish",
    description: "Rare sparkling fish that commands premium prices.",
    icon: Fish
  },
  {
    id: "turtle-shell",
    name: "Turtle Shell",
    price: 235,
    type: "animal",
    description: "Rare turtle shell with high trading value.",
    icon: Fish
  }
];

const rebelItems: RebelItem[] = [
  {
    id: "c4-charge",
    name: "C-4 Plastic Charge",
    price: 40000,
    icon: Target,
    description: "High-explosive plastic charge for bank operations.",
    category: "explosive"
  },
  {
    id: "five-seven",
    name: "Five seveN",
    price: 5000,
    icon: Zap,
    description: "Compact tactical pistol with high stopping power.",
    category: "weapon"
  },
  {
    id: "five-seven-mag",
    name: "Five seveN 20 rounds mag",
    price: 80,
    icon: Shield,
    description: "Extended magazine for the Five seveN pistol.",
    category: "accessory"
  },
  {
    id: "g17",
    name: "G17",
    price: 50000,
    icon: Zap,
    description: "Professional grade service pistol.",
    category: "weapon"
  },
  {
    id: "g17-mag",
    name: "G17 17 Round Mag",
    price: 1000,
    icon: Shield,
    description: "Standard capacity magazine for G17 pistol.",
    category: "accessory"
  },
  {
    id: "gold-plating",
    name: "Gold Plating Kit",
    price: 50000,
    icon: Star,
    description: "Premium gold plating kit for weapon customization.",
    category: "accessory"
  },
  {
    id: "lockpick",
    name: "Lockpick",
    price: 1500,
    icon: Wrench,
    description: "Professional lockpicking tools for entry operations.",
    category: "equipment"
  },
  {
    id: "money-bag",
    name: "Money Bag Sell",
    sellPrice: 100000,
    icon: DollarSign,
    description: "High-value money bag for trading operations. This item cannot be purchased - only sold.",
    category: "accessory",
    isSelectable: true
  },
  {
    id: "rp-radio",
    name: "Roleplay Radio",
    price: 15,
    icon: Settings,
    description: "Communication device for coordinated operations.",
    category: "equipment"
  },
  {
    id: "saltpeter",
    name: "Saltpeter",
    price: 20,
    icon: Mountain,
    description: "Chemical compound used in explosive manufacturing.",
    category: "equipment"
  },
  {
    id: "silver-plating",
    name: "Silver Plating Kit",
    price: 25000,
    icon: Gem,
    description: "Silver plating kit for weapon customization.",
    category: "accessory"
  },
  {
    id: "vault-drill",
    name: "Vault Drill",
    price: 5000,
    icon: Settings,
    description: "Specialized drilling equipment for vault operations.",
    category: "equipment"
  },
  {
    id: "zipties",
    name: "Zipties",
    price: 1500,
    icon: AlertTriangle,
    description: "Heavy-duty restraints for tactical operations.",
    category: "equipment"
  }
];

// ===== STYLING CONSTANTS =====

const categoryColors = {
  basic: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  intermediate: "from-blue-500/20 to-cyan-500/20 border-blue-500/30", 
  advanced: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  special: "from-red-500/20 to-pink-500/20 border-red-500/30",
  transport: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  rally: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  premium: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  weapon: "from-red-500/20 to-orange-500/20 border-red-500/30",
  equipment: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  explosive: "from-red-600/20 to-red-700/20 border-red-600/40",
  accessory: "from-gray-500/20 to-slate-500/20 border-gray-500/30"
};

const rarityColors = {
  common: "text-gray-300",
  uncommon: "text-green-400", 
  rare: "text-blue-400",
  legendary: "text-purple-400"
};

const typeColors = {
  equipment: "text-blue-400",
  fish: "text-green-400", 
  animal: "text-purple-400"
};

// ===== MAIN COMPONENT =====

export default function GeneralInformationPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("licenses");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { 
      id: "licenses" as TabType, 
      label: "License Prices", 
      icon: IdCardIcon, 
      count: licenses.length,
      description: "Mining and resource extraction permits"
    },
    { 
      id: "vehicles" as TabType, 
      label: "Vehicle Shop", 
      icon: Car, 
      count: vehicles.length,
      description: "Cars, minibuses, and premium vehicles"
    },
    { 
      id: "fishing" as TabType, 
      label: "Fish Trader", 
      icon: Fish, 
      count: fishingItems.length,
      description: "Fishing equipment and marine life"
    },
    { 
      id: "rebel" as TabType, 
      label: "Rebel Outpost", 
      icon: Skull, 
      count: rebelItems.length,
      description: "Black market weapons and equipment"
    },
    { 
      id: "more" as TabType, 
      label: "More Coming", 
      icon: Plus, 
      count: 0,
      description: "Additional information categories"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isClient ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              General <span className="gradient-text">Information</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Complete information hub for Narcos Life - All essential server data, prices, and information in one convenient location.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto mb-8"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                <IdCardIcon className="w-4 h-4" />
                <span className="font-semibold">{licenses.length}</span>
              </div>
              <p className="text-white/60 text-sm">Licenses</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                <Car className="w-4 h-4" />
                <span className="font-semibold">{vehicles.length}</span>
              </div>
              <p className="text-white/60 text-sm">Vehicles</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
                <Fish className="w-4 h-4" />
                <span className="font-semibold">{fishingItems.length}</span>
              </div>
              <p className="text-white/60 text-sm">Fish Items</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                <Skull className="w-4 h-4" />
                <span className="font-semibold">{rebelItems.length}</span>
              </div>
              <p className="text-white/60 text-sm">Rebel Items</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
                <Star className="w-4 h-4" />
                <span className="font-semibold">∞</span>
              </div>
              <p className="text-white/60 text-sm">More Soon</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={isClient ? "visible" : "hidden"}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-2">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={tab.id === "more"}
                    className={`relative p-4 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-purple-500/30 border border-purple-500/50"
                        : tab.id === "more"
                        ? "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                    aria-label={`Switch to ${tab.label} tab`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive ? "bg-purple-500/20" : "bg-white/10 group-hover:bg-white/20"
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isActive ? "text-purple-300" : "text-white/60 group-hover:text-white/80"
                        }`} />
                      </div>
                      
                      <div className="text-center">
                        <h3 className={`font-semibold text-sm ${
                          isActive ? "text-purple-200" : "text-white/80"
                        }`}>
                          {tab.label}
                        </h3>
                        <p className={`text-xs ${
                          isActive ? "text-purple-300/70" : "text-white/50"
                        }`}>
                          {tab.description}
                        </p>
                        {tab.count > 0 && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            isActive 
                              ? "bg-purple-500/30 text-purple-200" 
                              : "bg-white/10 text-white/60"
                          }`}>
                            {tab.count} items
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Licenses Tab */}
          {activeTab === "licenses" && (
            <motion.div
              key="licenses"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {licenses.map((license) => {
                  const IconComponent = license.icon;
                  
                  return (
                    <motion.div
                      key={license.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative bg-gradient-to-br ${categoryColors[license.category]} 
                        backdrop-blur-sm border rounded-2xl p-6 group cursor-pointer
                        hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300`}
                      role="article"
                      aria-labelledby={`license-${license.id}-title`}
                    >
                      {license.isRecommended && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 
                          text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Starter
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <div className={`text-xs font-medium ${rarityColors[license.rarity]} capitalize`}>
                          {license.rarity}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 
                          id={`license-${license.id}-title`}
                          className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors"
                        >
                          {license.name}
                        </h3>
                        
                        <p className="text-white/60 text-sm leading-relaxed">
                          {license.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div className="flex-1">
                            <span className="text-white/40 text-xs uppercase tracking-wide">License Price</span>
                            <div className="flex items-center gap-1">
                              {license.price === "Free" ? (
                                <span className="text-2xl font-bold text-green-400">Free</span>
                              ) : (
                                <span className="text-2xl font-bold text-white">
                                  ${license.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {license.sellPrice > 0 && (
                            <div className="text-right">
                              <span className="text-white/40 text-xs uppercase tracking-wide">Sell Price</span>
                              <div className="text-lg font-bold text-green-400">
                                ${license.sellPrice}
                                {license.id === "coal" && <span className="text-xs">/bucket</span>}
                                {license.id === "sand" && <span className="text-xs">/pane</span>}
                                {license.id === "copper" && <span className="text-xs">/bar</span>}
                                {license.id === "iron" && <span className="text-xs">/bar</span>}
                                {license.id === "cotton" && <span className="text-xs">/sheet</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <motion.div
              key="vehicles"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => {
                  const IconComponent = vehicle.icon;
                  
                  return (
                    <motion.div
                      key={vehicle.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative bg-gradient-to-br ${categoryColors[vehicle.category]} 
                        backdrop-blur-sm border rounded-2xl p-6 group cursor-pointer
                        hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300`}
                      role="article"
                      aria-labelledby={`vehicle-${vehicle.id}-title`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="text-xs font-medium text-blue-400 capitalize">
                          {vehicle.category}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 
                          id={`vehicle-${vehicle.id}-title`}
                          className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors"
                        >
                          {vehicle.name}
                        </h3>
                        
                        <p className="text-white/60 text-sm leading-relaxed">
                          {vehicle.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <div>
                            <span className="text-white/40 text-xs uppercase tracking-wide">Price</span>
                            <div className="text-2xl font-bold text-white">
                              ${vehicle.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Fishing Tab */}
          {activeTab === "fishing" && (
            <motion.div
              key="fishing"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="space-y-8">
                {/* Equipment Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-400" />
                    Fishing Equipment
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {fishingItems.filter(item => item.type === "equipment").map((item) => {
                      const IconComponent = item.icon;
                      
                      return (
                        <motion.div
                          key={item.id}
                          variants={cardVariants}
                          whileHover="hover"
                          className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30
                            backdrop-blur-sm rounded-2xl p-6 group cursor-pointer
                            hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                          role="article"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                              <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                            </div>
                            {item.tier && (
                              <div className="text-xs font-medium text-blue-400">
                                Tier {item.tier}
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                              {item.name}
                            </h3>
                            
                            <p className="text-white/60 text-sm leading-relaxed">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div>
                                <span className="text-white/40 text-xs uppercase tracking-wide">Price</span>
                                <div className="text-2xl font-bold text-white">
                                  ${item.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Fish & Animals Section */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Fish className="w-6 h-6 text-green-400" />
                    Fish & Marine Life
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {fishingItems.filter(item => item.type === "fish" || item.type === "animal").map((item) => {
                      const IconComponent = item.icon;
                      
                      return (
                        <motion.div
                          key={item.id}
                          variants={cardVariants}
                          whileHover="hover"
                          className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30
                            backdrop-blur-sm rounded-2xl p-6 group cursor-pointer
                            hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
                          role="article"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                              <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                            </div>
                            <div className="text-xs font-medium text-green-400 capitalize">
                              Catchable
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-green-200 transition-colors">
                              {item.name}
                            </h3>
                            
                            <p className="text-white/60 text-sm leading-relaxed">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div>
                                <span className="text-white/40 text-xs uppercase tracking-wide">Sell Price</span>
                                <div className="text-2xl font-bold text-green-400">
                                  ${item.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rebel Outpost Tab */}
          {activeTab === "rebel" && (
            <motion.div
              key="rebel"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-8 h-8 text-red-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Rebel Outpost - Black Market</h2>
                    <p className="text-red-200/70">Requires Black Market License to access</p>
                  </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-200 text-sm mb-2">
                        <strong>Important:</strong> Most items can be purchased here. Only Money Bags are sellable (cannot be bought).
                      </p>
                      <p className="text-red-200/70 text-xs">
                        Access to this outpost is granted through the Black Market License ($50,000).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rebelItems.map((item) => {
                  const IconComponent = item.icon;
                  
                  return (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative bg-gradient-to-br ${categoryColors[item.category]} 
                        backdrop-blur-sm border rounded-2xl p-6 group cursor-pointer
                        hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300`}
                      role="article"
                      aria-labelledby={`rebel-${item.id}-title`}
                    >
                      {item.isSelectable && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 
                          text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Sellable
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="text-xs font-medium text-red-400 capitalize">
                          {item.category}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 
                          id={`rebel-${item.id}-title`}
                          className="text-xl font-bold text-white group-hover:text-red-200 transition-colors"
                        >
                          {item.name}
                        </h3>
                        
                        <p className="text-white/60 text-sm leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          {item.sellPrice && !item.price ? (
                            // Only sell price for Money Bag
                            <div className="w-full text-center">
                              <span className="text-white/40 text-xs uppercase tracking-wide">Sell Price</span>
                              <div className="text-2xl font-bold text-green-400">
                                ${item.sellPrice.toLocaleString()}
                              </div>
                              <p className="text-white/50 text-xs mt-1">Cannot be purchased</p>
                            </div>
                          ) : item.price && item.sellPrice ? (
                            // Both buy and sell price
                            <>
                              <div className="flex-1">
                                <span className="text-white/40 text-xs uppercase tracking-wide">Buy Price</span>
                                <div className="text-2xl font-bold text-white">
                                  ${item.price.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-white/40 text-xs uppercase tracking-wide">Sell Price</span>
                                <div className="text-lg font-bold text-green-400">
                                  ${item.sellPrice.toLocaleString()}
                                </div>
                              </div>
                            </>
                          ) : (
                            // Only buy price
                            <div>
                              <span className="text-white/40 text-xs uppercase tracking-wide">Buy Price</span>
                              <div className="text-2xl font-bold text-white">
                                ${item.price?.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* More Coming Tab */}
          {activeTab === "more" && (
            <motion.div
              key="more"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-16"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-12 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-purple-400" />
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">More Categories Coming Soon</h2>
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                  We're constantly expanding our information database. Future categories may include:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Crafting Recipes</span>
                    </div>
                    <p className="text-white/60 text-sm">Complete crafting guides and material requirements</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingCart className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-white">Market Prices</span>
                    </div>
                    <p className="text-white/60 text-sm">Real-time market data and trading information</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold text-white">Job Information</span>
                    </div>
                    <p className="text-white/60 text-sm">Career paths, requirements, and earning potential</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Info className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-white">Game Mechanics</span>
                    </div>
                    <p className="text-white/60 text-sm">Detailed explanations of game systems and features</p>
                  </div>
                </div>
                
                <div className="mt-8 text-white/50 text-sm">
                  Have a suggestion for what information to add next? Let us know!
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Information Footer */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isClient ? "visible" : "hidden"}
          className="mt-16 grid md:grid-cols-3 gap-8"
        >
          {/* Update Notes */}
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Latest Updates
            </h2>
            <ul className="space-y-3 text-white/70" role="list">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>Added Rebel Outpost with complete black market pricing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">•</span>
                <span>Updated license pricing with material sell prices</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span>Revised fishing trader with accurate catch values</span>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Data Accuracy
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <Gem className="w-4 h-4" />
                <span className="text-sm font-medium">Verified Pricing</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Regular Updates</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Community Tested</span>
              </div>
              <p className="text-white/60 text-sm mt-4">
                All information is regularly verified and updated to ensure accuracy.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              Pro Tips
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-1 text-sm">Smart Progression</h3>
                <p className="text-white/60 text-sm">Start with free coal license, then gradually invest in higher-tier options</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-1 text-sm">Black Market Access</h3>
                <p className="text-white/60 text-sm">Black Market License unlocks the Rebel Outpost for advanced equipment</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-1 text-sm">Fishing ROI</h3>
                <p className="text-white/60 text-sm">Invest in T2+ fishing rods for better profit margins on catches</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}