/**
 * Mounts API utilities
 * Handles fetching mount data from the API
 */

// Cache for mounts data to avoid repeated requests
const mountsCache = new Map();

/**
 * Get mounts for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Mounts data
 */
export async function getMounts(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (mountsCache.has(cacheKey)) {
    return mountsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/mounts?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch mounts data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mounts: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const mounts = await response.json();
    
    // Cache the result
    mountsCache.set(cacheKey, mounts);
    
    return mounts;
  } catch (error) {
    console.error('Error fetching mounts:', error);
    throw error;
  }
}

/**
 * Clear mounts cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearMountsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    mountsCache.delete(cacheKey);
  } else {
    // Clear all cache
    mountsCache.clear();
  }
}

/**
 * Get mock mounts data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock mounts data
 */
export function getMockMounts() {
  return {
    collected: 250,
    possible: 400,
    isAlliance: true,
    categories: [
      {
        name: "Flying",
        subcats: [
          {
            name: "Basic",
            mounts: [
              { 
                id: 1, 
                icon: "ability_mount_gryphon", 
                name: "Gryphon", 
                description: "Fast flying mount", 
                collected: true,
                source: {
                  text: "Purchased from Flightmaster",
                  link: "https://www.wowhead.com/item=123"
                }
              },
              { 
                id: 2, 
                icon: "ability_mount_wyvern", 
                name: "Wyvern", 
                description: "Fast flying mount for Horde", 
                collected: false,
                source: {
                  text: "Purchased from Flightmaster",
                  link: "https://www.wowhead.com/item=456"
                }
              }
              // Additional mounts would be listed here in a real implementation
            ]
          },
          {
            name: "Epic",
            mounts: [
              { 
                id: 3, 
                icon: "ability_mount_drake", 
                name: "Bronze Drake", 
                description: "Epic flying mount", 
                collected: true,
                source: {
                  text: "Drops from Culling of Stratholme",
                  link: "https://www.wowhead.com/item=789"
                }
              }
              // Additional mounts would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Ground",
        subcats: [
          {
            name: "Basic",
            mounts: [
              { 
                id: 4, 
                icon: "ability_mount_whitetiger", 
                name: "White Tiger", 
                description: "Basic ground mount", 
                collected: true,
                source: {
                  text: "Purchased from Mount Vendor",
                  link: "https://www.wowhead.com/item=101"
                }
              }
              // Additional mounts would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}