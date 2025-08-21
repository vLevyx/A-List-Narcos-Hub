// src/lib/crafting-data.ts

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
  requiresRecipe?: boolean; // For items that need blueprints
}

export type CraftingCategory = 
  | "Weapon Parts"
  | "Rifles" 
  | "Handguns"
  | "Magazines"
  | "Vest"
  | "Clothing"
  | "Backpack"
  | "Materials"
  | "Other";

export type ItemTag = "Gatherable" | "Processed" | "Lootable" | "Craftable";

// Item categorization with tags
export const ITEM_TAGS: Record<string, ItemTag> = {
  // Gatherable items
  "Coal": "Gatherable",
  "Sand": "Gatherable", 
  "Unprocessed Copper": "Gatherable",
  "Unprocessed Iron": "Gatherable",
  "Cotton": "Gatherable",
  "Unprocessed Diamonds": "Gatherable",
  "Saltpeter": "Gatherable",

  // Processed items
  "Glass": "Processed",
  "Iron bar": "Processed",
  "Copper bar": "Processed", 
  "Cloth": "Processed",
  "Processed Diamonds": "Processed",
  "Diamond": "Processed",

  // Lootable items
  "Kevlar Weave": "Lootable",
  "Silver Plating Kit": "Lootable",
  "Gold Plating Kit": "Lootable",
  "Blue Dye": "Lootable",
  "Green Dye": "Lootable",
  "Pink Dye": "Lootable",
  "Red Dye": "Lootable",
  "Tan Dye": "Lootable",
  "Yellow Dye": "Lootable",
  "White Dye": "Lootable",
  "Cocaine": "Lootable",
  "Fentanyl": "Lootable"
};

// Non-craftable materials (can only be found/looted/gathered/processed)
export const NON_CRAFTABLE_MATERIALS = new Set([
  // Gatherable
  "Coal",
  "Sand", 
  "Unprocessed Copper",
  "Unprocessed Iron",
  "Cotton",
  "Unprocessed Diamonds",
  "Saltpeter",
  
  // Processed
  "Glass",
  "Iron bar",
  "Copper bar", 
  "Cloth",
  "Processed Diamonds",
  "Diamond",
  
  // Lootable
  "Kevlar Weave",
  "Silver Plating Kit",
  "Gold Plating Kit",
  "Blue Dye",
  "Green Dye",
  "Pink Dye",
  "Red Dye",
  "Tan Dye",
  "Yellow Dye",
  "White Dye",
  "Cocaine",
  "Fentanyl"
]);

// Get item tag
export function getItemTag(itemName: string): ItemTag {
  return ITEM_TAGS[itemName] || "Craftable";
}

// Get tag color classes
export function getTagColors(tag: ItemTag): { bg: string; text: string; border: string } {
  switch (tag) {
    case "Gatherable":
      return { 
        bg: "bg-emerald-500/20", 
        text: "text-emerald-300", 
        border: "border-emerald-500/30" 
      };
    case "Processed":
      return { 
        bg: "bg-blue-500/20", 
        text: "text-blue-300", 
        border: "border-blue-500/30" 
      };
    case "Lootable":
      return { 
        bg: "bg-amber-500/20", 
        text: "text-amber-300", 
        border: "border-amber-500/30" 
      };
    case "Craftable":
    default:
      return { 
        bg: "bg-purple-500/20", 
        text: "text-purple-300", 
        border: "border-purple-500/30" 
      };
  }
}

// ===== THREE-STAGE CALCULATION FUNCTIONS =====

/**
 * Calculate Stage 2: Sub-Direct Requirements
 * Returns all intermediate craftable items needed (not base materials, not direct requirements)
 */
export function calculateSubDirectRequirements(itemName: string, quantity: number): { [key: string]: number } {
  const subDirectReqs: { [key: string]: number } = {};
  const recipe = getCraftingRecipe(itemName);
  
  if (!recipe || recipe.requirements.length === 0) {
    return subDirectReqs;
  }
  
  // Get the direct requirements (Stage 3) to exclude them from Stage 2
  const directRequirementNames = new Set(recipe.requirements.map(req => req.item));
  
  // For each direct requirement, find its sub-components
  for (const requirement of recipe.requirements) {
    const reqRecipe = getCraftingRecipe(requirement.item);
    
    // If this requirement has sub-components, analyze them
    if (reqRecipe && reqRecipe.requirements.length > 0 && !NON_CRAFTABLE_MATERIALS.has(requirement.item)) {
      
      // Process the sub-components of this direct requirement
      for (const subReq of reqRecipe.requirements) {
        const subRecipe = getCraftingRecipe(subReq.item);
        
        // If it's craftable and not a base material, it goes in Stage 2
        if (subRecipe && subRecipe.requirements.length > 0 && !NON_CRAFTABLE_MATERIALS.has(subReq.item)) {
          const totalNeeded = subReq.quantity * requirement.quantity * quantity;
          subDirectReqs[subReq.item] = (subDirectReqs[subReq.item] || 0) + totalNeeded;
          
          // Recursively add deeper sub-components
          const deeperReqs = calculateSubDirectRequirements(subReq.item, totalNeeded);
          for (const [deepItem, deepQty] of Object.entries(deeperReqs)) {
            // Only add if it's not already a direct requirement
            if (!directRequirementNames.has(deepItem)) {
              subDirectReqs[deepItem] = (subDirectReqs[deepItem] || 0) + deepQty;
            }
          }
        }
      }
    }
  }
  
  return subDirectReqs;
}

/**
 * Calculate Stage 1: Base Materials Needed
 * Returns only the raw, non-craftable materials
 */
export function calculateBaseMaterials(itemName: string, quantity: number): { [key: string]: number } {
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
    const subResources = calculateBaseMaterials(requirement.item, totalNeeded);
    
    // Combine resources, handling duplicates
    for (const [subResourceName, subResourceQty] of Object.entries(subResources)) {
      resources[subResourceName] = (resources[subResourceName] || 0) + subResourceQty;
    }
  }
  
  return resources;
}

// Centralized crafting database with all fixes applied
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
      { item: "Slide", quantity: 2 },
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
      { item: "Slide", quantity: 1 }, // Fixed: was missing slide
      { item: "Stock", quantity: 1 },
      { item: "Trigger", quantity: 2 }
    ],
    craftingLevel: 10,
    craftingTime: 27,
    craftingXP: 500,
    requiresRecipe: true
  },
  "Spectre": {
    name: "Spectre",
    category: "Rifles",
    requirements: [
      { item: "Steel barrel", quantity: 2 },
      { item: "Steel receiver", quantity: 3 },
      { item: "Firing pin", quantity: 1 },
      { item: "Grip", quantity: 1 },
      { item: "Slide", quantity: 1 }, // Fixed: was 2, should be 1
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
    craftingLevel: 1, // Fixed: was 0, should be 1
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
    craftingLevel: 8, // Fixed: was 0, should be 8
    craftingTime: 8,
    craftingXP: 20
  },
  "Mac-10 Magazine": {
    name: "Mac-10 Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 6 }, // Fixed: was 5, should be 6
      { item: "Iron bar", quantity: 2 }
    ],
    craftingLevel: 10,
    craftingTime: 7,
    craftingXP: 25,
    requiresRecipe: true
  },
  "Spectre Magazine": {
    name: "Spectre Magazine",
    category: "Magazines",
    requirements: [
      { item: "Gunpowder", quantity: 5 },
      { item: "Iron bar", quantity: 1 }
    ],
    craftingLevel: 3, // Fixed: was 0, should be 3
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
    craftingXP: 10,
    requiresRecipe: true
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
    craftingXP: 5 // Fixed: was 10, should be 5
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
    craftingXP: 5 // Fixed: was 10, should be 5
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
    craftingXP: 5 // Fixed: was 10, should be 5
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
    craftingXP: 5 // Fixed: was 10, should be 5
  },
  "Balaclava Tan": {
    name: "Balaclava Tan",
    category: "Clothing",
    requirements: [
      { item: "Balaclava Black", quantity: 1 },
      { item: "Yellow Dye", quantity: 1 } // Fixed: was Tan Dye, should be Yellow Dye
    ],
    craftingLevel: 5,
    craftingTime: 23,
    craftingXP: 5 // Fixed: was 10, should be 5
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
      { item: "Green Dye", quantity: 1 },
      { item: "Yellow Dye", quantity: 1 } // Fixed: was missing Yellow Dye
    ],
    craftingLevel: 12, // Fixed: was 5, should be 12
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
    craftingTime: 2, // Fixed: This should be the base crafting time
    craftingXP: 10   // Fixed: This should be the base XP
  },
  "Sulfer": {
    name: "Sulfer",
    category: "Materials",
    requirements: [{ item: "Coal", quantity: 2 }],
    craftingLevel: 0,
    craftingTime: 4,
    craftingXP: 4
  },
  "Steel Plate": {
    name: "Steel Plate",
    category: "Materials",
    requirements: [{ item: "Steel bar", quantity: 10 }],
    craftingLevel: 0,
    craftingTime: 16,
    craftingXP: 20
  },

  // ===== OTHER =====
  "Binoculars": {
    name: "Binoculars",
    category: "Other",
    requirements: [
      { item: "Glass", quantity: 6 },
      { item: "Iron bar", quantity: 4 }
    ],
    craftingLevel: 0,
    craftingTime: 16,
    craftingXP: 15
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
export function getItemsByCategory(category: CraftingCategory): string[] {
  return Object.values(CRAFTING_RECIPES)
    .filter(recipe => recipe.category === category)
    .map(recipe => recipe.name)
    .sort();
}

/**
 * Get all available categories
 */
export function getAllCategories(): CraftingCategory[] {
  const categories = new Set<CraftingCategory>();
  Object.values(CRAFTING_RECIPES).forEach(recipe => categories.add(recipe.category as CraftingCategory));
  return Array.from(categories).sort();
}

/**
 * Get crafting recipe for a specific item
 */
export function getCraftingRecipe(itemName: string): CraftingRecipe | null {
  return CRAFTING_RECIPES[itemName] || null;
}