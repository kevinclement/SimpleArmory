/**
 * Heirlooms API utilities
 * Handles fetching heirloom data from the API
 */

// Cache for heirlooms data to avoid repeated requests
const heirloomsCache = new Map();

/**
 * Get heirlooms for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Heirlooms data
 */
export async function getHeirlooms(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (heirloomsCache.has(cacheKey)) {
    return heirloomsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/heirlooms?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch heirlooms data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch heirlooms: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const heirlooms = await response.json();
    
    // Cache the result
    heirloomsCache.set(cacheKey, heirlooms);
    
    return heirlooms;
  } catch (error) {
    console.error('Error fetching heirlooms:', error);
    throw error;
  }
}

/**
 * Clear heirlooms cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearHeirloomsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    heirloomsCache.delete(cacheKey);
  } else {
    // Clear all cache
    heirloomsCache.clear();
  }
}

/**
 * Get mock heirlooms data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock heirlooms data
 */
export function getMockHeirlooms() {
  return {
    collected: 75,
    possible: 150,
    categories: [
      {
        name: "Weapons",
        subcats: [
          {
            name: "One-Handed",
            heirlooms: [
              { 
                id: 105689, 
                icon: "inv_sword_30", 
                name: "Bloodied Arcanite Reaper", 
                description: "A mighty two-handed axe that will level up with you.", 
                collected: true,
                source: {
                  text: "Guild Vendor",
                  link: "https://www.wowhead.com/item=105689"
                }
              },
              { 
                id: 122349, 
                icon: "inv_axe_60", 
                name: "Bloody Dancing Steel", 
                description: "A one-handed axe that will level up with you.", 
                collected: false,
                source: {
                  text: "Adventuring Supplies Vendor",
                  link: "https://www.wowhead.com/item=122349"
                }
              }
              // Additional heirlooms would be listed here in a real implementation
            ]
          },
          {
            name: "Two-Handed",
            heirlooms: [
              { 
                id: 122352, 
                icon: "inv_sword_39", 
                name: "Champion Herod's Shoulder", 
                description: "Shoulder armor that will level up with you.", 
                collected: true,
                source: {
                  text: "Guild Vendor",
                  link: "https://www.wowhead.com/item=122352"
                }
              }
              // Additional heirlooms would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Armor",
        subcats: [
          {
            name: "Cloth",
            heirlooms: [
              { 
                id: 122260, 
                icon: "inv_chest_cloth_30", 
                name: "Ancient Bloodmoon Cloak", 
                description: "A cloth cloak that will level up with you.", 
                collected: true,
                source: {
                  text: "Darkmoon Faire",
                  link: "https://www.wowhead.com/item=122260"
                }
              }
              // Additional heirlooms would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}