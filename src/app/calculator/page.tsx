"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Package, Clock, Zap, AlertCircle, RotateCcw, ArrowRight, CheckCircle2, Circle, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTracking } from '@/hooks/usePageTracking';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

// Import from the updated data file
import {
  CRAFTING_RECIPES,
  NON_CRAFTABLE_MATERIALS,
  getAllCategories,
  getItemsByCategory,
  getCraftingRecipe,
  getItemTag,
  getTagColors,
  calculateBaseMaterials,
  calculateSubDirectRequirements,
  type CraftingCategory,
  type CraftingRecipe,
  type CraftingRequirement,
  type ItemTag
} from '@/lib/crafting-data';

const PURPLE_PRIMARY = '#8b5cf6';

// ===== COMPONENT INTERFACES =====

interface CalculationResults {
  item: string;
  quantity: number;
  directRequirements: CraftingRequirement[];
  subDirectRequirements: { [key: string]: number };
  baseResources: { [key: string]: number };
  totalTime: number;
  totalXP: number;
  craftingLevel: number;
  requiresRecipe?: boolean;
  recipeRequirements: CraftingRequirement[]; // New field for recipe/blueprint requirements
}

interface CraftingSettings {
  hasCraftingPerk: boolean;
  craftingPerkLevel: number; // 0 = no perk, 1 = 10% reduction, 2 = 20% reduction
}

// Progress tracking interface
interface ProgressTracker {
  [itemName: string]: {
    required: number;
    collected: number;
    completed: boolean;
  };
}

// Resource display component with tags and progress tracking
const ResourceItem = ({ 
  resource, 
  amount, 
  className = "",
  showStage = false,
  stage = "",
  progress,
  onProgressChange
}: { 
  resource: string; 
  amount: number; 
  className?: string;
  showStage?: boolean;
  stage?: string;
  progress?: { required: number; collected: number; completed: boolean };
  onProgressChange?: (resource: string, collected: number) => void;
}) => {
  // Handle special case for recipe/blueprint items
const isRecipeItem = resource.includes('Recipe/Blueprint');
const tag = isRecipeItem ? 'Recipe' as ItemTag : getItemTag(resource);
const tagColors = isRecipeItem 
  ? { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30" }
  : getTagColors(tag);
  
  const handleProgressClick = () => {
    if (!progress || !onProgressChange) return;
    const newCollected = progress.completed ? 0 : progress.required;
    onProgressChange(resource, newCollected);
  };

  const handleCollectedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onProgressChange) return;
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(0, Math.min(value, progress?.required || amount));
    onProgressChange(resource, clampedValue);
  };
  
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${tagColors.bg} border ${tagColors.border} ${className} ${progress?.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-2 flex-1 min-w-0">
  <button
    onClick={handleProgressClick}
    className="flex-shrink-0 hover:scale-110 transition-transform mt-0.5"
    aria-label={`Mark ${resource} as ${progress?.completed ? 'incomplete' : 'complete'}`}
  >
    {progress?.completed ? (
      <CheckCircle2 className="w-5 h-5 text-green-400" />
    ) : (
      <Circle className="w-5 h-5 text-gray-400" />
    )}
  </button>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-white/90 font-medium truncate">{resource}</span>
      <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${tagColors.bg} ${tagColors.text} border ${tagColors.border}`}>
        {tag}
      </span>
      {showStage && (
        <span className="text-xs px-2 py-0.5 rounded font-medium bg-gray-600 text-gray-200 whitespace-nowrap">
          {stage}
        </span>
      )}
    </div>
  </div>
</div>
      <div className="flex items-center gap-2">
        {progress && (
          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              min="0"
              max={progress.required}
              value={progress.collected}
              onChange={handleCollectedChange}
              className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center text-xs"
            />
            <span className="text-gray-400">/</span>
          </div>
        )}
        <span className={`font-bold ${tagColors.text}`}>{amount.toLocaleString()}</span>
      </div>
    </div>
  );
};

// Component breakdown resource item
const ComponentResourceItem = ({ 
  resource, 
  amount 
}: { 
  resource: string; 
  amount: number; 
}) => {
  const tag = getItemTag(resource);
  const tagColors = getTagColors(tag);
  
  return (
    <div className={`flex justify-between items-center p-2 rounded text-sm ${tagColors.bg} border ${tagColors.border}`}>
      <div className="flex items-center gap-1">
        <span className="text-white/80">{resource}</span>
        <span className={`text-xs px-1 py-0.5 rounded ${tagColors.bg} ${tagColors.text}`}>
          {tag}
        </span>
      </div>
      <span className={`font-medium ${tagColors.text}`}>
        {amount.toLocaleString()}
      </span>
    </div>
  );
};

// Settings modal component
const SettingsModal = ({ 
  settings, 
  onSettingsChange, 
  onClose 
}: { 
  settings: CraftingSettings;
  onSettingsChange: (settings: CraftingSettings) => void;
  onClose: () => void;
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">Crafting Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings.hasCraftingPerk}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  hasCraftingPerk: e.target.checked,
                  craftingPerkLevel: e.target.checked ? localSettings.craftingPerkLevel : 0
                })}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-white">I have the Crafting Perk</span>
            </label>
          </div>

          {localSettings.hasCraftingPerk && (
            <div>
              <label className="block text-white/90 font-medium mb-2">Perk Level</label>
              <select
                value={localSettings.craftingPerkLevel}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  craftingPerkLevel: parseInt(e.target.value)
                })}
                className="w-full bg-[#2a2a2a] border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value={1}>Level 1 (10% faster)</option>
                <option value={2}>Level 2 (20% faster)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NarcosCalculatorPage() {
  usePageTracking();
  const { hasAccess, loading, user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState<ProgressTracker>({});
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CraftingSettings>({
    hasCraftingPerk: false,
    craftingPerkLevel: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Load recently viewed from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('narcos-calculator-recent');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse recently viewed items');
      }
    }
  }, []);

  // Add item to recently viewed list
  const addToRecentlyViewed = (itemName: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item !== itemName);
      const updated = [itemName, ...filtered].slice(0, 5); // Keep only last 5 items
      localStorage.setItem('narcos-calculator-recent', JSON.stringify(updated));
      return updated;
    });
  };

  // Search functionality
  const searchAllItems = (query: string) => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const allItems = Object.values(CRAFTING_RECIPES)
      .map(recipe => ({
        name: recipe.name,
        category: recipe.category,
        level: recipe.craftingLevel,
        requiresRecipe: recipe.requiresRecipe
      }))
      .filter(item => item.name.toLowerCase().includes(lowercaseQuery))
      .sort((a, b) => {
        // Prioritize exact matches, then alphabetical
        const aStartsWith = a.name.toLowerCase().startsWith(lowercaseQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowercaseQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Limit to 8 results

    return allItems;
  };

  const searchResults = searchQuery ? searchAllItems(searchQuery) : [];

  const handleSearchSelect = (itemName: string) => {
    const recipe = getCraftingRecipe(itemName);
    if (recipe) {
      setSelectedCategory(recipe.category);
      setSelectedItem(itemName);
      setSearchQuery("");
      setShowSearchResults(false);
      addToRecentlyViewed(itemName);
    }
  };

  const handleRecentSelect = (itemName: string) => {
    const recipe = getCraftingRecipe(itemName);
    if (recipe) {
      setSelectedCategory(recipe.category);
      setSelectedItem(itemName);
      addToRecentlyViewed(itemName);
    }
  };
  const categoryOptions = [
    { value: "", label: "Select Category" },
    ...getAllCategories().map(category => ({
      value: category,
      label: category
    }))
  ];

  // Generate item options from the organized data (without tags in labels)
  const itemOptions = [
    { value: "", label: "Select Item" },
    ...(selectedCategory 
      ? getItemsByCategory(selectedCategory as CraftingCategory).map(item => {
          const recipe = getCraftingRecipe(item);
          let label = item;
          
          if (recipe && recipe.craftingLevel > 0) {
            label += ` (Level ${recipe.craftingLevel})`;
          }
          
          if (recipe && recipe.requiresRecipe) {
            label += ` [Requires Recipe]`;
          }
          
          return {
            value: item,
            label
          };
        })
      : [])
  ];

  /**
   * Apply crafting perk time reduction
   */
  const applyCraftingPerkTime = (baseTime: number): number => {
    if (!settings.hasCraftingPerk) return baseTime;
    
    const reductionPercent = settings.craftingPerkLevel === 2 ? 0.20 : 0.10;
    return Math.ceil(baseTime * (1 - reductionPercent));
  };

  /**
   * Calculate crafting time for ONLY the final item (not recursive)
   */
  const calculateFinalItemTime = (itemName: string, qty: number): number => {
    const recipe = getCraftingRecipe(itemName);
    
    if (!recipe || recipe.requirements.length === 0 || NON_CRAFTABLE_MATERIALS.has(itemName)) {
      return 0;
    }
    
    const baseTime = recipe.craftingTime * qty;
    return applyCraftingPerkTime(baseTime);
  };

  /**
   * Calculate crafting XP for ONLY the final item (not recursive)
   */
  const calculateFinalItemXP = (itemName: string, qty: number): number => {
    const recipe = getCraftingRecipe(itemName);
    
    if (!recipe || recipe.requirements.length === 0 || NON_CRAFTABLE_MATERIALS.has(itemName)) {
      return 0;
    }
    
    return recipe.craftingXP * qty;
  };

  // Update calculate materials to add to recently viewed
  const calculateMaterials = () => {
    if (!selectedItem || quantity <= 0) {
      setResults(null);
      return;
    }
    
    // Add to recently viewed when calculating
    addToRecentlyViewed(selectedItem);
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const recipe = getCraftingRecipe(selectedItem);
      
      // Stage 3: Direct Requirements
      const directRequirements = recipe ? recipe.requirements : [];
      
      // Stage 2: Sub-Direct Requirements
      const subDirectRequirements = calculateSubDirectRequirements(selectedItem, quantity);
      
      // Stage 1: Base Materials
      const baseResources = calculateBaseMaterials(selectedItem, quantity);
      
      // Fixed: Only calculate time and XP for the final item
      const totalTime = calculateFinalItemTime(selectedItem, quantity);
      const totalXP = calculateFinalItemXP(selectedItem, quantity);
      
      // Calculate recipe requirements if needed
const recipeRequirements: CraftingRequirement[] = [];
if (recipe?.requiresRecipe) {
  recipeRequirements.push({ 
    item: `${selectedItem} Recipe/Blueprint`, 
    quantity: 1 
  });
}

setResults({
  item: selectedItem,
  quantity,
  directRequirements,
  subDirectRequirements,
  baseResources,
  totalTime,
  totalXP,
  craftingLevel: recipe?.craftingLevel || 0,
  requiresRecipe: recipe?.requiresRecipe || false,
  recipeRequirements
});
      
      // Initialize progress tracking
      const newProgress: ProgressTracker = {};
      Object.entries(baseResources).forEach(([resource, amount]) => {
        newProgress[resource] = {
          required: amount as number,
          collected: 0,
          completed: false
        };
      });
      setProgress(newProgress);
      
      setIsCalculating(false);
    }, 300);
  };

  const handleProgressChange = (resource: string, collected: number) => {
    setProgress(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        collected,
        completed: collected >= prev[resource].required
      }
    }));
  };

  const resetProgress = () => {
    const newProgress: ProgressTracker = {};
    Object.entries(progress).forEach(([resource, data]) => {
      newProgress[resource] = {
        ...data,
        collected: 0,
        completed: false
      };
    });
    setProgress(newProgress);
  };

  useEffect(() => {
    if (selectedItem && quantity > 0) {
      calculateMaterials();
    } else {
      setResults(null);
      setProgress({});
    }
  }, [selectedItem, quantity, settings]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setProgress({});
  };

  // Calculate completion progress based on actual quantities collected
  const { totalCollected, totalRequired, completionPercentage } = Object.values(progress).reduce(
    (acc, item) => ({
      totalCollected: acc.totalCollected + item.collected,
      totalRequired: acc.totalRequired + item.required,
      completionPercentage: 0 // Will calculate below
    }),
    { totalCollected: 0, totalRequired: 0, completionPercentage: 0 }
  );
  
  const actualCompletionPercentage = totalRequired > 0 ? Math.round((totalCollected / totalRequired) * 100) : 0;

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
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">

              {/* Quick Search */}
              <div className="relative search-container">
                <label className="block text-white/90 font-medium mb-3">Quick Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                    placeholder="Type to search all items..."
                    className="w-full bg-[#2a2a2a] border border-white/20 rounded-xl px-4 py-3 pr-10 text-white 
                             focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 
                             transition-all placeholder:text-gray-400"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a2a] border border-white/20 rounded-xl shadow-2xl z-[60] max-h-80 overflow-y-auto">
                    {searchResults.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchSelect(item.name)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white font-medium group-hover:text-purple-300 transition-colors">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{item.category}</span>
                              {item.level > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                  Level {item.level}
                                </span>
                              )}
                              {item.requiresRecipe && (
                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                                  Recipe Required
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recently Viewed */}
              {recentlyViewed.length > 0 && (
                <div>
                  <label className="block text-white/90 font-medium mb-3">Recently Viewed</label>
                  <div className="flex flex-wrap gap-2">
                    {recentlyViewed.map((itemName, index) => {
                      const recipe = getCraftingRecipe(itemName);
                      return (
                        <button
                          key={index}
                          onClick={() => handleRecentSelect(itemName)}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 
                                   rounded-lg transition-all duration-200 group"
                        >
                          <Clock className="w-3 h-3 text-purple-300" />
                          <span className="text-sm text-white group-hover:text-purple-200">
                            {itemName}
                          </span>
                          {recipe && recipe.craftingLevel > 0 && (
                            <span className="text-xs px-1 py-0.5 bg-purple-600/50 text-purple-200 rounded">
                              {recipe.craftingLevel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category Dropdown */}
              <div>
                <label className="block text-white/90 font-medium mb-3">Category</label>
                <div className="w-full border border-white/20 rounded-xl bg-[#2a2a2a] relative z-50">
                  <CustomDropdown
                    value={selectedCategory}
                    onChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedItem("");
                      setResults(null);
                      setProgress({});
                    }}
                    options={categoryOptions}
                    placeholder="Select Category"
                  />
                </div>
              </div>

              {/* Item Dropdown */}
              <div>
                <label className="block text-white/90 font-medium mb-3">Item</label>
                <div className={`w-full border border-white/20 rounded-xl bg-[#2a2a2a] relative z-40 ${!selectedCategory ? 'opacity-50 pointer-events-none' : ''}`}>
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
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex gap-3">
                    <button
                      onClick={resetCalculator}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    
                    {Object.keys(progress).length > 0 && (
                      <button
                        onClick={resetProgress}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                      >
                        <Circle className="w-4 h-4" />
                        Reset Progress
                      </button>
                    )}
                  </div>
                  
                  {Object.keys(progress).length > 0 && (
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">
                          Progress: {totalCollected.toLocaleString()}/{totalRequired.toLocaleString()} items ({actualCompletionPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300 shadow-lg"
                          style={{ 
                            width: `${actualCompletionPercentage}%`,
                            boxShadow: actualCompletionPercentage > 0 ? '0 0 10px rgba(139, 92, 246, 0.4)' : 'none'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {(results || isCalculating) && (
            <div className="mt-8 bg-background-secondary/80 backdrop-blur-lg border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl relative z-10">
              
              {isCalculating ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-[#8b5cf6] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Calculating materials...</p>
                </div>
              ) : results && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: PURPLE_PRIMARY }}>
                      Three-Stage Crafting Plan
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
                      {results.requiresRecipe && (
                        <span className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          Requires Recipe/Blueprint
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage 1: Base Materials Needed */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold border-b border-emerald-600 pb-2 mb-4 text-emerald-300 flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Base Materials Needed
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">Raw materials you need to gather/loot from the world</p>

                    {Object.keys(results.baseResources).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(results.baseResources)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([resource, amount]) => (
                            <ResourceItem
                              key={resource}
                              resource={resource}
                              amount={amount as number}
                              progress={progress[resource]}
                              onProgressChange={handleProgressChange}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        No base materials required (loot-only item)
                      </div>
                    )}
                  </div>

                  {/* Stage 2: Sub-Direct Requirements */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold border-b border-blue-600 pb-2 mb-4 text-blue-300 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Sub-Direct Requirements
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">Intermediate items you need to craft first</p>

                    {Object.keys(results.subDirectRequirements).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(results.subDirectRequirements)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([resource, amount]) => (
                            <ResourceItem
                              key={resource}
                              resource={resource}
                              amount={amount as number}
                            />
                          ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        No intermediate components required
                      </div>
                    )}
                  </div>

                  {/* Recipe Requirements (if needed) */}
{results.recipeRequirements.length > 0 && (
  <div className="mb-8">
    <h2 className="text-xl font-semibold border-b border-red-600 pb-2 mb-4 text-red-300 flex items-center gap-2">
  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
  Recipe/Blueprint Required
</h2>
    <p className="text-gray-400 text-sm mb-4">You must have this recipe/blueprint in your inventory to craft this item</p>
    
    <div className="space-y-2">
      {results.recipeRequirements.map((req, index) => (
        <ResourceItem
  key={index}
  resource={req.item}
  amount={req.quantity}
  className="bg-red-500/10 border-red-500/30"
/>
      ))}
    </div>
  </div>
)}

{/* Stage 3: Direct Requirements */}
<div className="mb-8">
  <h2 className="text-xl font-semibold border-b border-purple-600 pb-2 mb-4 text-purple-300 flex items-center gap-2">
    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
    Direct Requirements
  </h2>
  <p className="text-gray-400 text-sm mb-4">Items you need in your inventory for the final craft</p>

                    {results.directRequirements.length > 0 ? (
                      <div className="space-y-2">
                        {results.directRequirements.map((req, index) => (
                          <ResourceItem
                            key={index}
                            resource={req.item}
                            amount={req.quantity * results.quantity}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        This item has no direct crafting requirements (loot-only item)
                      </div>
                    )}
                  </div>

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
                        <div className="text-2xl font-bold text-yellow-300">
                          {formatTime(results.totalTime)}
                          {settings.hasCraftingPerk && (
                            <span className="text-xs text-green-400 block">
                              -{settings.craftingPerkLevel * 10}% Perk
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">Final Craft Time</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-300">{results.totalXP.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Final Craft XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Breakdown */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
                      Resource Breakdown by Component
                    </h2>
                    
                    {(() => {
                      if (results.directRequirements.length === 0) {
                        return (
                          <div className="text-gray-400 italic p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                            No component breakdown available for loot-only items
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {results.directRequirements.map((req, index) => {
                            const componentResources = calculateBaseMaterials(req.item, req.quantity * results.quantity);
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
                                      .map(([resource, amount]) => (
                                        <ComponentResourceItem
                                          key={resource}
                                          resource={resource}
                                          amount={amount as number}
                                        />
                                      ))}
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

                  {/* Tag Legend */}
                  {/* Tag Legend */}
<div className="mt-8">
  <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4" style={{ color: PURPLE_PRIMARY }}>
    Material Type Legend
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
      <div className="text-emerald-300 font-bold mb-1">Gatherable</div>
      <div className="text-xs text-gray-400">Materials you can mine/gather from the world</div>
    </div>
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
      <div className="text-blue-300 font-bold mb-1">Processed</div>
      <div className="text-xs text-gray-400">Materials processed from gathered resources</div>
    </div>
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
      <div className="text-amber-300 font-bold mb-1">Lootable</div>
      <div className="text-xs text-gray-400">Items from Cartel Shipments or Chemical Trucks</div>
    </div>
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
      <div className="text-purple-300 font-bold mb-1">Craftable</div>
      <div className="text-xs text-gray-400">Items that must be crafted at workbenches</div>
    </div>
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
  <div className="text-red-300 font-bold mb-1">Recipe</div>
  <div className="text-xs text-gray-400">Recipe/Blueprint required in inventory</div>
</div>
  </div>
</div>

                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}