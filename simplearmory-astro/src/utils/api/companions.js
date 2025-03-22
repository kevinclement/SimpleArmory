/**
 * Companions API utilities
 * Handles fetching companion data from the API
 */

// Cache for companions data to avoid repeated requests
const companionsCache = new Map();

/**
 * Get companions for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Companions data
 */
export async function getCompanions(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (companionsCache.has(cacheKey)) {
    return companionsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/companions?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch companions data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch companions: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const companions = await response.json();
    
    // Cache the result
    companionsCache.set(cacheKey, companions);
    
    return companions;
  } catch (error) {
    console.error('Error fetching companions:', error);
    throw error;
  }
}

/**
 * Clear companions cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearCompanionsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    companionsCache.delete(cacheKey);
  } else {
    // Clear all cache
    companionsCache.clear();
  }
}

/**
 * Get mock companions data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock companions data
 */
export function getMockCompanions() {
  return {
    collected: 150,
    possible: 300,
    categories: [
      {
        name: "Humanoid",
        subcats: [
          {
            name: "Gnome",
            companions: [
              { 
                id: 1, 
                icon: "inv_misc_pet_01", 
                name: "Mechanical Squirrel", 
                description: "A small mechanical squirrel that follows you around.", 
                collected: true,
                source: {
                  text: "Engineering",
                  link: "https://www.wowhead.com/item=4055"
                }
              },
              { 
                id: 2, 
                icon: "inv_misc_pet_02", 
                name: "Mechanical Chicken", 
                description: "A small mechanical chicken that follows you around.", 
                collected: false,
                source: {
                  text: "Quest: CLUCK!",
                  link: "https://www.wowhead.com/item=10398"
                }
              }
              // Additional companions would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Beast",
        subcats: [
          {
            name: "Cat",
            companions: [
              { 
                id: 3, 
                icon: "inv_pet_cats_blacktabby", 
                name: "Black Tabby Cat", 
                description: "A small black tabby cat that follows you around.", 
                collected: true,
                source: {
                  text: "Drop: Various mobs in Hillsbrad Foothills",
                  link: "https://www.wowhead.com/item=8489"
                }
              }
              // Additional companions would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}