/**
 * Toys API utilities
 * Handles fetching toy data from the API
 */

// Cache for toys data to avoid repeated requests
const toysCache = new Map();

/**
 * Get toys for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Toys data
 */
export async function getToys(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (toysCache.has(cacheKey)) {
    return toysCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/toys?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch toys data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch toys: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const toys = await response.json();
    
    // Cache the result
    toysCache.set(cacheKey, toys);
    
    return toys;
  } catch (error) {
    console.error('Error fetching toys:', error);
    throw error;
  }
}

/**
 * Clear toys cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearToysCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    toysCache.delete(cacheKey);
  } else {
    // Clear all cache
    toysCache.clear();
  }
}

/**
 * Get mock toys data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock toys data
 */
export function getMockToys() {
  return {
    collected: 125,
    possible: 250,
    categories: [
      {
        name: "World Events",
        subcats: [
          {
            name: "Winter Veil",
            toys: [
              { 
                id: 70923, 
                icon: "inv_misc_gift_01", 
                name: "Gaudy Winter Veil Sweater", 
                description: "Wear this gaudy sweater during Winter Veil.", 
                collected: true,
                source: {
                  text: "Winter Veil Gift",
                  link: "https://www.wowhead.com/item=70923"
                }
              },
              { 
                id: 71076, 
                icon: "inv_holiday_christmas_present_01", 
                name: "Red Rider Air Rifle", 
                description: "Shoot your friends with this air rifle.", 
                collected: false,
                source: {
                  text: "Winter Veil Gift",
                  link: "https://www.wowhead.com/item=71076"
                }
              }
              // Additional toys would be listed here in a real implementation
            ]
          },
          {
            name: "Hallow's End",
            toys: [
              { 
                id: 116856, 
                icon: "inv_misc_food_94_mageroyal", 
                name: "Magic Pet Mirror", 
                description: "Transform yourself into a random battle pet.", 
                collected: true,
                source: {
                  text: "Hallow's End reward",
                  link: "https://www.wowhead.com/item=116856"
                }
              }
              // Additional toys would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Miscellaneous",
        subcats: [
          {
            name: "Curiosities",
            toys: [
              { 
                id: 86573, 
                icon: "inv_misc_dice_01", 
                name: "Blackrock Dice", 
                description: "Roll the dice to determine your fate.", 
                collected: true,
                source: {
                  text: "Drop: Various Blackrock Mountain bosses",
                  link: "https://www.wowhead.com/item=86573"
                }
              }
              // Additional toys would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}