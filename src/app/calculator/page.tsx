"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Package, Clock, Zap, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTracking } from '@/hooks/usePageTracking';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

const PURPLE_PRIMARY = '#8b5cf6';

// ===== ORGANIZED CRAFTING SYSTEM =====

export interface CraftingRequirement {
  item: string;
  quantity: number;
}

export interface CraftingRecipe {
  name: string;
  category: string;
  requirements: CraftingRequirement[];
  craftingLevel: number;
  craftingTime: number;
  craftingXP: number;
}

export type CraftingCategory = 
  | "Weapon Parts"
  | "Rifles" 
  | "Handguns"
  | "Magazines"
  | "Vest"
  | "Clothing"
  | "Backpack"
  | "Materials";

// Non-craftable materials (can only be found/looted)
const NON_CRAFTABLE_MATERIALS = new Set([
  "Kevlar Weave",
  "Iron bar",
  "Copper bar", 
  "Coal",
  "Diamond",
  "Saltpeter",
  "Cloth",
  "Silver Plating Kit",
  "Gold Plating Kit",
  "Blue Dye",
  "Green Dye",
  "Pink Dye",
  "Red Dye",
  "Tan Dye",
  "Yellow Dye",
  "White Dye"
]);

// Centralized crafting database
export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  // ===== WEAPON PARTS =====
  "Steel barrel": {
    name: "Steel barrel",
    category: "Weapon Parts",
    requirements: [{ item: "Steel bar", quantity: 12 }],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 10
  },
  "Steel receiver": {
    name: "Steel receiver", 
    category: "Weapon Parts",
    requirements: [{ item: "Steel bar", quantity: 12 }],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 10
  },
  "Firing pin": {
    name: "Firing pin",
    category: "Weapon Parts",
    requirements: [
      { item: "Iron bar", quantity: 2 },
      { item: "Copper bar", quantity: 2 },
      { item: "Coal", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 4
  },
  "Grip": {
    name: "Grip",
    category: "Weapon Parts", 
    requirements: [
      { item: "Copper bar", quantity: 2 },
      { item: "Iron bar", quantity: 2 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 4
  },
  "Slide": {
    name: "Slide",
    category: "Weapon Parts",
    requirements: [{ item: "Iron bar", quantity: 2 }],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 4
  },
  "Stock": {
    name: "Stock",
    category: "Weapon Parts",
    requirements: [{ item: "Copper bar", quantity: 2 }],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 4
  },
  "Trigger": {
    name: "Trigger",
    category: "Weapon Parts",
    requirements: [
      { item: "Iron bar", quantity: 2 },
      { item: "Copper bar", quantity: 2 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 4
  },
  "Hardened firing pin": {
    name: "Hardened firing pin",
    category: "Weapon Parts",
    requirements: [
      { item: "Diamond", quantity: 10 },
      { item: "Firing pin", quantity: 1 },
      { item: "Steel bar", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 16,
    craftingXP: 8
  },

  // ===== RIFLES =====
  "AKS74U": {
    name: "AKS74U",
    category: "Rifles",
    requirements: [
      { item: "Steel barrel", quantity: 3 },
      { item: "Steel receiver", quantity: 3 },
      { item: "Hardened firing pin", quantity: 1 },
      { item: "Grip", quantity: 2 },
      { item: "Slide", quantity: 2 },
      { item: "Stock", quantity: 2 },
      { item: "Trigger", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 30,
    craftingXP: 200
  },
  "AK74": {
    name: "AK74",
    category: "Rifles",
    requirements: [
      { item: "Steel barrel", quantity: 4 },
      { item: "Steel receiver", quantity: 4 },
      { item: "Hardened firing pin", quantity: 1 },
      { item: "Grip", quantity: 2 },
      { item: "Stock", quantity: 3 },
      { item: "Trigger", quantity: 1 }
    ],
    craftingLevel: 8,
    craftingTime: 30,
    craftingXP: 300
  },
  "Silver AK74": {
    name: "Silver AK74",
    category: "Rifles",
    requirements: [
      { item: "AK74", quantity: 1 },
      { item: "Silver Plating Kit", quantity: 1 }
    ],
    craftingLevel: 8,
    craftingTime: 27,
    craftingXP: 100
  },
  "Gold AK74": {
    name: "Gold AK74",
    category: "Rifles",
    requirements: [
      { item: "AK74", quantity: 1 },
      { item: "Gold Plating Kit", quantity: 1 }
    ],
    craftingLevel: 10,
    craftingTime: 27,
    craftingXP: 100
  },
  "Mac-10": {
    name: "Mac-10",
    category: "Rifles",
    requirements: [
      { item: "Steel barrel", quantity: 6 },
      { item: "Steel receiver", quantity: 4 },
      { item: "Hardened firing pin", quantity: 1 },
      { item: "Grip", quantity: 1 },
      { item: "Stock", quantity: 1 },
      { item: "Trigger", quantity: 2 }
    ],
    craftingLevel: 10,
    craftingTime: 27,
    craftingXP: 500
  },
  "Spectre": {
    name: "Spectre",
    category: "Rifles",
    requirements: [
      { item: "Steel barrel", quantity: 2 },
      { item: "Steel receiver", quantity: 3 },
      { item: "Firing pin", quantity: 1 },
      { item: "Grip", quantity: 1 },
      { item: "Slide", quantity: 1 },
      { item: "Stock", quantity: 1 },
      { item: "Trigger", quantity: 1 }
    ],
    craftingLevel: 4,
    craftingTime: 30,
    craftingXP: 175
  },

  // ===== HANDGUNS =====
  "Desert eagle": {
    name: "Desert eagle",
    category: "Handguns",
    requirements: [
      { item: "Steel barrel", quantity: 1 },
      { item: "Steel receiver", quantity: 1 },
      { item: "Firing pin", quantity: 1 },
      { item: "Grip", quantity: 1 },
      { item: "Slide", quantity: 1 },
      { item: "Stock", quantity: 1 },
      { item: "Trigger", quantity: 1 }
    ],
    craftingLevel: 1,
    craftingTime: 30,
    craftingXP: 150
  },

  // ===== MAGAZINES =====
  "Desert eagle magazine": {
    name: "Desert eagle magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 3 },
      { item: "Iron bar", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 20
  },
  "AK Magazine": {
    name: "AK Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 5 },
      { item: "Iron bar", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 20
  },
  "Mac-10 Magazine": {
    name: "Mac-10 Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 5 },
      { item: "Iron bar", quantity: 2 }
    ],
    craftingLevel: 10,
    craftingTime: 7,
    craftingXP: 25
  },
  "Spectre Magazine": {
    name: "Spectre Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 5 },
      { item: "Iron bar", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 8,
    craftingXP: 20
  },
  "Spectre Drum Magazine": {
    name: "Spectre Drum Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 10 },
      { item: "Iron bar", quantity: 5 }
    ],
    craftingLevel: 10,
    craftingTime: 30,
    craftingXP: 10
  },

  // ===== VEST =====
  "Ballistic vest": {
    name: "Ballistic vest",
    category: "Vest",
    requirements: [
      { item: "Steel Plate", quantity: 10 },
      { item: "Kevlar Weave", quantity: 3 }
    ],
    craftingLevel: 10,
    craftingTime: 54,
    craftingXP: 400
  },

  // ===== CLOTHING =====
  "Balaclava Black": {
    name: "Balaclava Black",
    category: "Clothing",
    requirements: [{ item: "Cloth", quantity: 25 }],
    craftingLevel: 2,
    craftingTime: 23,
    craftingXP: 5
  },
  "Balaclava Blue": {
    name: "Balaclava Blue",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Blue Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5
  },
  "Balaclava Green": {
    name: "Balaclava Green",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Green Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5
  },
  "Balaclava Pink": {
    name: "Balaclava Pink",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Pink Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5
  },
  "Balaclava Red": {
    name: "Balaclava Red",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Red Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5
  },
  "Balaclava Tan": {
    name: "Balaclava Tan",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Tan Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5
  },
  "Hiking Pants Blue": {
    name: "Hiking Pants Blue",
    category: "Clothing",
    requirements: [
      { item: "Cloth", quantity: 25 },
      { item: "Blue Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 54,
    craftingXP: 15
  },
  "Hiking Pants Green": {
    name: "Hiking Pants Green",
    category: "Clothing",
    requirements: [
      { item: "Cloth", quantity: 25 },
      { item: "Green Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 54,
    craftingXP: 15
  },
  "Hiking Pants Multicam": {
    name: "Hiking Pants Multicam",
    category: "Clothing",
    requirements: [
      { item: "Cloth", quantity: 25 },
      { item: "Green Dye", quantity: 1 }
    ],
    craftingLevel: 5,
    craftingTime: 54,
    craftingXP: 15
  },
  "Hiking Pants Rainbow": {
    name: "Hiking Pants Rainbow",
    category: "Clothing",
    requirements: [
      { item: "Cloth", quantity: 25 },
      { item: "Green Dye", quantity: 1 },
      { item: "Yellow Dye", quantity: 1 },
      { item: "Red Dye", quantity: 1 },
      { item: "Pink Dye", quantity: 1 },
      { item: "Blue Dye", quantity: 1 },
      { item: "White Dye", quantity: 1 }
    ],
    craftingLevel: 15,
    craftingTime: 54,
    craftingXP: 500
  },

  // ===== BACKPACK =====
  "Upgraded Bergen": {
    name: "Upgraded Bergen",
    category: "Backpack",
    requirements: [{ item: "Cloth", quantity: 75 }],
    craftingLevel: 8,
    craftingTime: 54,
    craftingXP: 20
  },
  "Upgraded Bergen Forest": {
    name: "Upgraded Bergen Forest",
    category: "Backpack",
    requirements: [
      { item: "Cloth", quantity: 75 },
      { item: "Green Dye", quantity: 1 }
    ],
    craftingLevel: 8,
    craftingTime: 27,
    craftingXP: 5
  },
  "Upgraded Bergen Khaki": {
    name: "Upgraded Bergen Khaki",
    category: "Backpack",
    requirements: [
      { item: "Cloth", quantity: 75 },
      { item: "Yellow Dye", quantity: 1 }
    ],
    craftingLevel: 8,
    craftingTime: 27,
    craftingXP: 5
  },

  // ===== MATERIALS =====
  "Steel bar": {
    name: "Steel bar",
    category: "Materials",
    requirements: [
      { item: "Iron bar", quantity: 2 },
      { item: "Coal", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 4,
    craftingXP: 5
  },
  "Gunpowder": {
    name: "Gunpowder",
    category: "Materials",
    requirements: [
      { item: "Saltpeter", quantity: 2 },
      { item: "Sulfer", quantity: 1 }
    ],
    craftingLevel: 0,
    craftingTime: 2,
    craftingXP: 10
  },
  "Sulfer": {
    name: "Sulfer",
    category: "Materials",
    requirements: [{ item: "Coal", quantity: 2 }],
    craftingLevel: 0,
    craftingTime: 4,
    craftingXP: 4
  },
  "Steel plate": {
    name: "Steel plate",
    category: "Materials",
    requirements: [{ item: "Steel bar", quantity: 10 }],
    craftingLevel: 0,
    craftingTime: 16,
    craftingXP: 20
  },
  // Kevlar Weave - non-craftable material (loot only)
  "Kevlar Weave": {
    name: "Kevlar Weave",
    category: "Materials",
    requirements: [], // No requirements - can only be found
    craftingLevel: 0,
    craftingTime: 0,
    craftingXP: 0
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get all items in a specific category
 */
function getItemsByCategory(category: CraftingCategory): string[] {
  return Object.values(CRAFTING_RECIPES)
    .filter(recipe => recipe.category === category)
    .map(recipe => recipe.name)
    .sort();
}

/**
 * Get all available categories
 */
function getAllCategories(): CraftingCategory[] {
  const categories = new Set<CraftingCategory>();
  Object.values(CRAFTING_RECIPES).forEach(recipe => categories.add(recipe.category as CraftingCategory));
  return Array.from(categories).sort();
}

/**
 * Get crafting recipe for a specific item
 */
function getCraftingRecipe(itemName: string): CraftingRecipe | null {
  return CRAFTING_RECIPES[itemName] || null;
}

// ===== COMPONENT INTERFACES =====

interface CalculationResults {
  item: string;
  quantity: number;
  baseResources: { [key: string]: number };
  totalTime: number;
  totalXP: number;
  craftingLevel: number;
}

export default function NarcosCalculatorPage() {
  usePageTracking();
  const { hasAccess, loading, user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Generate category options from the organized data
  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...getAllCategories().map(category => ({
      value: category,
      label: category
    }))
  ];

  // Generate item options from the organized data
  const itemOptions = [
    { value: "", label: "Select Item" },
    ...(selectedCategory 
      ? getItemsByCategory(selectedCategory as CraftingCategory).map(item => {
          const recipe = getCraftingRecipe(item);
          return {
            value: item,
            label: `${item}${recipe && recipe.craftingLevel > 0 ? ` (Level ${recipe.craftingLevel})` : ''}`
          };
        })
      : [])
  ];

  /**
   * Recursively collect all base materials needed for crafting an item
   * This handles nested requirements like Gold AK74 → AK74 → Steel barrel, etc.
   */
  const collectBaseResources = (itemName: string, quantity: number): { [key: string]: number } => {
    const resources: { [key: string]: number } = {};
    const recipe = getCraftingRecipe(itemName);
    
    // If item has no recipe or is non-craftable, treat it as a base resource
    if (!recipe || recipe.requirements.length === 0 || NON_CRAFTABLE_MATERIALS.has(itemName)) {
      resources[itemName] = quantity;
      return resources;
    }
    
    // Process each requirement recursively
    for (const requirement of recipe.requirements) {
      const totalNeeded = requirement.quantity * quantity;
      const subResources = collectBaseResources(requirement.item, totalNeeded);
      
      // Combine resources, handling duplicates
      for (const [subResourceName, subResourceQty] of Object.entries(subResources)) {
        resources[subResourceName] = (resources[subResourceName] || 0) + subResourceQty;
      }
    }
    
    return resources;
  };

  /**
   * Calculate total crafting time recursively
   */
  const calculateTotalTime = (itemName: string, qty: number): number => {
    const recipe = getCraftingRecipe(itemName);
    
    // If item has no recipe or is non-craftable, no time required
    if (!recipe || recipe.requirements.length === 0 || NON_CRAFTABLE_MATERIALS.has(itemName)) {
      return 0;
    }
    
    let totalTime = recipe.craftingTime * qty;
    
    // Add time for all sub-components
    for (const requirement of recipe.requirements) {
      totalTime += calculateTotalTime(requirement.item, requirement.quantity * qty);
    }
    
    return totalTime;
  };

  /**
   * Calculate total crafting XP recursively
   */
  const calculateTotalXP = (itemName: string, qty: number): number => {
    const recipe = getCraftingRecipe(itemName);
    
    // If item has no recipe or is non-craftable, no XP gained
    if (!recipe || recipe.requirements.length === 0 || NON_CRAFTABLE_MATERIALS.has(itemName)) {
      return 0;
    }
    
    let totalXP = recipe.craftingXP * qty;
    
    // Add XP for all sub-components
    for (const requirement of recipe.requirements) {
      totalXP += calculateTotalXP(requirement.item, requirement.quantity * qty);
    }
    
    return totalXP;
  };

  const calculateMaterials = () => {
    if (!selectedItem || quantity <= 0) {
      setResults(null);
      return;
    }
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const recipe = getCraftingRecipe(selectedItem);
      const baseResources = collectBaseResources(selectedItem, quantity);
      const totalTime = calculateTotalTime(selectedItem, quantity);
      const totalXP = calculateTotalXP(selectedItem, quantity);
      
      setResults({
        item: selectedItem,
        quantity,
        baseResources,
        totalTime,
        totalXP,
        craftingLevel: recipe?.craftingLevel || 0
      });
      
      setIsCalculating(false);
    }, 300);
  };

  useEffect(() => {
    if (selectedItem && quantity > 0) {
      calculateMaterials();
    } else {
      setResults(null);
    }
  }, [selectedItem, quantity]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const resetCalculator = () => {
    setSelectedCategory("");
    setSelectedItem("");
    setQuantity(1);
    setResults(null);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-background-secondary/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6 sm:mb-8 flex-wrap gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center flex-wrap" style={{ color: PURPLE_PRIMARY }}>
                Crafting Calculator
                <span className="ml-2 text-xs text-black px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: PURPLE_PRIMARY }}>
                  Narcos
                </span>
              </h1>
            </div>

            <div className="space-y-4 sm:space-y-6">

              {/* Category Dropdown */}
              <div>
                <label className="block text-white/90 font-medium mb-3">Category</label>
                <div className="w-full border border-white/20 rounded-xl bg-[#2a2a2a]">
                  <CustomDropdown
                    value={selectedCategory}
                    onChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedItem("");
                      setResults(null);
                    }}
                    options={categoryOptions}
                    placeholder="Select Category"
                  />
                </div>
              </div>

              {/* Item Dropdown */}
              <div>
                <label className="block text-white/90 font-medium mb-3">Item</label>
                <div className={`w-full border border-white/20 rounded-xl bg-[#2a2a2a] ${!selectedCategory ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CustomDropdown
                    value={selectedItem}
                    onChange={(value) => setSelectedItem(value)}
                    options={itemOptions}
                    placeholder="Select Item"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-3">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    setQuantity(newQuantity);
                  }}
                  className="w-full bg-[#2a2a2a] border border-white/20 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 
                           transition-all placeholder:text-gray-400"
                  placeholder="1"
                />
              </div>

              {(selectedCategory || selectedItem || results) && (
                <div className="flex justify-end">
                  <button
                    onClick={resetCalculator}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {(results || isCalculating) && (
            <div className="mt-8 bg-background-secondary/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
              
              {isCalculating ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-[#8b5cf6] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Calculating materials...</p>
                </div>
              ) : results && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: PURPLE_PRIMARY }}>
                      Crafting Requirements
                    </h2>
                    <div className="flex justify-center items-center gap-6 text-sm text-gray-400 flex-wrap">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {results.quantity}x {results.item}
                      </span>
                      {results.craftingLevel > 0 && (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Level {results.craftingLevel} Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Requirements Section */}
                  <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
                    Direct Requirements
                  </h2>

                  {(() => {
                    const recipe = getCraftingRecipe(results.item);
                    return recipe && recipe.requirements.length > 0 ? (
                      <div className="space-y-2 mb-6">
                        {recipe.requirements.map((req, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
                          >
                            <span className="text-white/90 font-medium">{req.item}</span>
                            <span className="text-purple-300 font-bold">{(req.quantity * results.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic mb-6 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        This item has no direct crafting requirements (loot-only item)
                      </div>
                    );
                  })()}

                  {/* Resources Needed Section */}
                  <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
                    Base Materials Needed
                  </h2>

                  {Object.keys(results.baseResources).length > 0 && (
                    <div className="space-y-3 mb-6">
                      {Object.entries(results.baseResources)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([resource, amount]) => {
                          const isNonCraftable = NON_CRAFTABLE_MATERIALS.has(resource);
                          return (
                            <div 
                              key={resource} 
                              className={`flex justify-between items-center p-3 rounded-lg ${
                                isNonCraftable 
                                  ? 'bg-amber-500/10 border border-amber-500/20' 
                                  : 'bg-blue-500/10 border border-blue-500/20'
                              }`}
                            >
                              <span className="text-white/90 font-medium">{resource}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{(amount as number).toLocaleString()}</span>
                                {isNonCraftable && (
                                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                                    Loot Only
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Summary Statistics */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
                      Summary Statistics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-300">{Object.keys(results.baseResources).length}</div>
                        <div className="text-sm text-gray-400">Material Types</div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-300">
                          {Object.values(results.baseResources).reduce((a: number, b) => a + (b as number), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Items</div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-300">{formatTime(results.totalTime)}</div>
                        <div className="text-sm text-gray-400">Crafting Time</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-300">{results.totalXP.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Total XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Breakdown */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
                      Resource Breakdown by Component
                    </h2>
                    
                    {(() => {
                      const recipe = getCraftingRecipe(results.item);
                      if (!recipe || recipe.requirements.length === 0) {
                        return (
                          <div className="text-gray-400 italic p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                            No component breakdown available for loot-only items
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {recipe.requirements.map((req, index) => {
                            const componentResources = collectBaseResources(req.item, req.quantity * results.quantity);
                            const hasResources = Object.keys(componentResources).length > 0;
                            
                            return (
                              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
                                  <span>{req.item}</span>
                                  <span className="text-sm text-purple-300 font-normal">
                                    {(req.quantity * results.quantity).toLocaleString()}x needed
                                  </span>
                                </h3>
                                
                                {hasResources ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {Object.entries(componentResources)
                                      .sort(([a], [b]) => a.localeCompare(b))
                                      .map(([resource, amount]) => {
                                        const isNonCraftable = NON_CRAFTABLE_MATERIALS.has(resource);
                                        return (
                                          <div 
                                            key={resource}
                                            className={`flex justify-between items-center p-2 rounded text-sm ${
                                              isNonCraftable 
                                                ? 'bg-amber-500/10 border border-amber-500/20' 
                                                : 'bg-blue-500/10 border border-blue-500/20'
                                            }`}
                                          >
                                            <span className="text-white/80">{resource}</span>
                                            <div className="flex items-center gap-1">
                                              <span className={`font-medium ${
                                                isNonCraftable ? 'text-amber-300' : 'text-blue-300'
                                              }`}>
                                                {(amount as number).toLocaleString()}
                                              </span>
                                              {isNonCraftable && (
                                                <span className="text-xs bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded">
                                                  Loot
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                ) : (
                                  <div className="text-amber-300 italic text-sm bg-amber-500/10 border border-amber-500/20 rounded p-2">
                                    Loot-only item - no crafting materials required
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>


                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}