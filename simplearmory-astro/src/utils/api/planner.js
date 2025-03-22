/**
 * Planner API utilities
 * Handles fetching and processing planner data for mount collection planning
 */

// Cache for planner steps data to avoid repeated processing
const plannerCache = new Map();

/**
 * Get planner steps for a character's mount collection
 * @param {object} mountsData - The character's mount collection data
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<Array>} - Array of planner steps
 */
export async function getPlannerSteps(mountsData, region, realm, character) {
  if (!mountsData) {
    throw new Error('Mount data is required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (plannerCache.has(cacheKey)) {
    return plannerCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/planner?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch planner data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch planner data: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const plannerData = await response.json();
    
    // Generate steps from planner data and mounts data
    const steps = generatePlannerSteps(plannerData, mountsData);
    
    // Cache the result
    plannerCache.set(cacheKey, steps);
    
    return steps;
  } catch (error) {
    console.error('Error fetching planner data:', error);
    
    // Fallback to using just mounts data if API fails
    const steps = generateFallbackSteps(mountsData);
    return steps;
  }
}

/**
 * Generate planner steps from planner data and mounts data
 * @param {object} plannerData - Planner data from API
 * @param {object} mountsData - Mounts collection data
 * @returns {Array} - Array of planner steps
 */
function generatePlannerSteps(plannerData, mountsData) {
  if (!plannerData || !plannerData.steps) {
    return [];
  }
  
  // Return the steps directly from planner data
  return plannerData.steps;
}

/**
 * Generate fallback planner steps from mounts data if API fails
 * @param {object} mountsData - Mounts collection data
 * @returns {Array} - Array of basic planner steps
 */
function generateFallbackSteps(mountsData) {
  // If all mounts are collected, return empty array
  if (mountsData.collected === mountsData.possible) {
    return [];
  }
  
  // Create a simple fallback planner with basic recommendations
  const steps = [];
  const uncollectedMounts = [];
  
  // Find uncollected mounts
  mountsData.categories.forEach(category => {
    category.subcats.forEach(subcat => {
      subcat.mounts.forEach(mount => {
        if (!mount.collected) {
          uncollectedMounts.push({
            mount: mount.name,
            category: category.name,
            subcat: subcat.name,
            icon: mount.icon,
            itemId: mount.id,
            source: mount.source
          });
        }
      });
    });
  });
  
  // Group uncollected mounts by source type
  const dungeonMounts = uncollectedMounts.filter(m => 
    m.source && (
      m.source.text.toLowerCase().includes('dungeon') || 
      m.source.text.toLowerCase().includes('raid')
    )
  );
  
  const reputationMounts = uncollectedMounts.filter(m => 
    m.source && m.source.text.toLowerCase().includes('reputation')
  );
  
  const rareDropMounts = uncollectedMounts.filter(m => 
    m.source && m.source.text.toLowerCase().includes('drops')
  );
  
  const purchasableMounts = uncollectedMounts.filter(m => 
    m.source && (
      m.source.text.toLowerCase().includes('vendor') || 
      m.source.text.toLowerCase().includes('purchase')
    )
  );
  
  // Add dungeon mounts to planner
  if (dungeonMounts.length > 0) {
    steps.push({
      title: "Farm Dungeon & Raid Mounts",
      notes: "Run these instances for a chance at rare mount drops",
      bosses: dungeonMounts.map(mount => ({
        name: mount.source ? mount.source.text.split(' from ')[1] || "Boss" : "Boss",
        mount: mount.mount,
        icon: mount.icon,
        itemId: mount.itemId,
        epic: mount.category === "Epic",
        note: "Reset and repeat for better chances"
      }))
    });
  }
  
  // Add rare drop mounts to planner
  if (rareDropMounts.length > 0) {
    steps.push({
      title: "Hunt Rare Spawns",
      notes: "These mounts drop from rare spawns in the world",
      bosses: rareDropMounts.map(mount => ({
        name: mount.source ? mount.source.text.split(' from ')[1] || "Rare Spawn" : "Rare Spawn",
        mount: mount.mount,
        icon: mount.icon,
        itemId: mount.itemId,
        epic: false,
        note: "Check spawn timers and locations online"
      }))
    });
  }
  
  // Add reputation mounts to planner
  if (reputationMounts.length > 0) {
    steps.push({
      title: "Earn Reputation",
      notes: "Gain reputation with these factions to purchase mounts",
      bosses: reputationMounts.map(mount => ({
        name: mount.source ? mount.source.text.split(' with ')[1] || "Faction" : "Faction",
        mount: mount.mount,
        icon: mount.icon,
        itemId: mount.itemId,
        epic: false,
        note: "Complete daily quests and turn in items for reputation"
      }))
    });
  }
  
  // Add purchasable mounts to planner
  if (purchasableMounts.length > 0) {
    steps.push({
      title: "Purchase from Vendors",
      notes: "These mounts can be purchased directly",
      bosses: purchasableMounts.map(mount => ({
        name: mount.source ? mount.source.text.split(' from ')[1] || "Vendor" : "Vendor",
        mount: mount.mount,
        icon: mount.icon,
        itemId: mount.itemId,
        epic: false,
        note: "May require gold or specific currencies"
      }))
    });
  }
  
  // Add capital city step if player's faction is known
  if (mountsData.isAlliance !== undefined) {
    steps.unshift({
      title: "Capital",
      capital: true,
      notes: "Start your mount hunt from your faction's capital city",
      hearth: false
    });
  }
  
  return steps;
}

/**
 * Clear planner cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearPlannerCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    plannerCache.delete(cacheKey);
  } else {
    // Clear all cache
    plannerCache.clear();
  }
}

/**
 * Get mock planner steps for development/testing
 * @returns {Array} - Mock planner steps
 */
export function getMockPlannerSteps() {
  return [
    {
      title: "Capital",
      capital: true,
      notes: "Begin your mount farming journey",
      hearth: false,
      bosses: []
    },
    {
      title: "Icecrown Citadel",
      notes: "Located in Northrend",
      bosses: [
        {
          name: "The Lich King",
          mount: "Invincible",
          icon: "ability_mount_celestialhorse",
          itemId: 50818,
          epic: true,
          note: "~1% drop rate. Farmable weekly."
        }
      ]
    },
    {
      title: "Firelands",
      notes: "Located in Mount Hyjal",
      bosses: [
        {
          name: "Alysrazor",
          mount: "Flametalon of Alysrazor",
          icon: "ability_mount_fireravengodmount",
          itemId: 71665,
          epic: false,
          note: "~1% drop rate. Farmable weekly."
        },
        {
          name: "Ragnaros",
          mount: "Pureblood Fire Hawk",
          icon: "ability_mount_firehavkrocketmount",
          itemId: 69224,
          epic: true,
          note: "~1% drop rate. Farmable weekly."
        }
      ]
    }
  ];
}