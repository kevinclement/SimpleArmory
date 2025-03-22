/**
 * Achievements API utilities
 * Handles fetching achievement data from the API
 */

// Cache for achievement data to avoid repeated requests
const achievementsCache = new Map();

/**
 * Get achievements for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Achievement data
 */
export async function getAchievements(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (achievementsCache.has(cacheKey)) {
    return achievementsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/achievements?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch achievement data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch achievements: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const achievements = await response.json();
    
    // Cache the result
    achievementsCache.set(cacheKey, achievements);
    
    return achievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
}

/**
 * Clear achievements cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearAchievementsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    achievementsCache.delete(cacheKey);
  } else {
    // Clear all cache
    achievementsCache.clear();
  }
}

/**
 * Mock achievement data for development/testing
 * @param {string} region - WoW region
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {object} - Mock achievement data
 */
export function getMockAchievements(region, realm, character) {
  return {
    completed: 850,
    possible: 1200,
    'Characters': { completed: 75, possible: 100, legacyTotal: "10", foSTotal: "5" },
    'Quests': { completed: 85, possible: 120, legacyTotal: "15", foSTotal: "7" },
    'Exploration': { completed: 90, possible: 110, legacyTotal: "8", foSTotal: "4" },
    'Delves': { completed: 30, possible: 50, legacyTotal: "3", foSTotal: "2" },
    'Player vs. Player': { completed: 40, possible: 80, legacyTotal: "5", foSTotal: "3" },
    'Dungeons & Raids': { completed: 120, possible: 150, legacyTotal: "20", foSTotal: "10" },
    'Professions': { completed: 60, possible: 75, legacyTotal: "7", foSTotal: "3" },
    'Reputation': { completed: 45, possible: 60, legacyTotal: "6", foSTotal: "2" },
    'World Events': { completed: 55, possible: 70, legacyTotal: "7", foSTotal: "4" },
    'Pet Battles': { completed: 35, possible: 55, legacyTotal: "5", foSTotal: "2" },
    'Collections': { completed: 65, possible: 90, legacyTotal: "8", foSTotal: "3" },
    'Expansion Features': { completed: 70, possible: 95, legacyTotal: "9", foSTotal: "4" },
    'Legacy': { completed: 80, possible: 80, legacyTotal: "80", foSTotal: "0" },
    'Feats of Strength': { completed: 30, possible: 30, legacyTotal: "0", foSTotal: "30" }
  };
}