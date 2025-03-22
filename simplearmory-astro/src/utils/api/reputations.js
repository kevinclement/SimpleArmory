/**
 * Reputations API utilities
 * Handles fetching reputation data from the API
 */

// Cache for reputations data to avoid repeated requests
const reputationsCache = new Map();

/**
 * Get reputations for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Reputations data
 */
export async function getReputations(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (reputationsCache.has(cacheKey)) {
    return reputationsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/reputations?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch reputations data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reputations: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const reputations = await response.json();
    
    // Cache the result
    reputationsCache.set(cacheKey, reputations);
    
    return reputations;
  } catch (error) {
    console.error('Error fetching reputations:', error);
    throw error;
  }
}

/**
 * Clear reputations cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearReputationsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    reputationsCache.delete(cacheKey);
  } else {
    // Clear all cache
    reputationsCache.clear();
  }
}

/**
 * Get standing text from standing id
 * @param {number} standing - Standing ID
 * @returns {string} - Standing text
 */
export function getStandingText(standing) {
  const standings = {
    0: 'Hated',
    1: 'Hostile',
    2: 'Unfriendly',
    3: 'Neutral',
    4: 'Friendly',
    5: 'Honored',
    6: 'Revered',
    7: 'Exalted',
    8: 'Paragon'
  };
  
  return standings[standing] || 'Unknown';
}

/**
 * Get mock reputations data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock reputations data
 */
export function getMockReputations() {
  return {
    categories: [
      {
        name: "Classic",
        factions: [
          {
            name: "Argent Dawn",
            id: 529,
            standing: 7,
            value: 21000,
            max: 21000
          },
          {
            name: "Cenarion Circle",
            id: 609,
            standing: 5,
            value: 12000,
            max: 21000
          }
        ]
      },
      {
        name: "The Burning Crusade",
        factions: [
          {
            name: "The Scryers",
            id: 934,
            standing: 7,
            value: 21000,
            max: 21000
          },
          {
            name: "Cenarion Expedition",
            id: 942,
            standing: 6,
            value: 18000,
            max: 21000
          }
        ]
      },
      {
        name: "Wrath of the Lich King",
        factions: [
          {
            name: "Knights of the Ebon Blade",
            id: 1098,
            standing: 7,
            value: 21000,
            max: 21000
          },
          {
            name: "Kirin Tor",
            id: 1090,
            standing: 4,
            value: 8000,
            max: 12000
          }
        ]
      }
    ]
  };
}