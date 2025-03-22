/**
 * Battle Pets API utilities
 * Handles fetching battle pets data from the API
 */

// Cache for battle pets data to avoid repeated requests
const battlePetsCache = new Map();

/**
 * Get battle pets for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Battle pets data
 */
export async function getBattlePets(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (battlePetsCache.has(cacheKey)) {
    return battlePetsCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/battlePets?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch battle pets data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch battle pets: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const battlePets = await response.json();
    
    // Cache the result
    battlePetsCache.set(cacheKey, battlePets);
    
    return battlePets;
  } catch (error) {
    console.error('Error fetching battle pets:', error);
    throw error;
  }
}

/**
 * Clear battle pets cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearBattlePetsCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    battlePetsCache.delete(cacheKey);
  } else {
    // Clear all cache
    battlePetsCache.clear();
  }
}

/**
 * Get mock battle pets data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock battle pets data
 */
export function getMockBattlePets() {
  return {
    collected: 120,
    possible: 350,
    categories: [
      {
        name: "Aquatic",
        subcats: [
          {
            name: "Aquatic",
            pets: [
              { 
                id: 115,
                icon: "spell_frost_summonwaterelemental", 
                name: "Pengu", 
                description: "A cute and playful penguin.", 
                collected: true,
                qualityId: 3,
                maxLevel: 25,
                currentLevel: 25,
                source: {
                  text: "Drop: Ahune",
                  link: "https://www.wowhead.com/npc=25740"
                }
              },
              { 
                id: 325,
                icon: "inv_pet_babycrab", 
                name: "Strand Crab", 
                description: "A small crab found along the shores of Azeroth.", 
                collected: false,
                source: {
                  text: "Pet Battle: Wild",
                  link: "https://www.wowhead.com/npc=61312"
                }
              }
              // Additional pets would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Beast",
        subcats: [
          {
            name: "Beast",
            pets: [
              { 
                id: 39,
                icon: "inv_box_petcarrier_01", 
                name: "Bombay Cat", 
                description: "A sleek black feline companion.", 
                collected: true,
                qualityId: 2,
                maxLevel: 25,
                currentLevel: 15,
                source: {
                  text: "Vendor: Breanni",
                  link: "https://www.wowhead.com/npc=96479"
                }
              }
              // Additional pets would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Flying",
        subcats: [
          {
            name: "Flying",
            pets: [
              { 
                id: 242,
                icon: "inv_pet_parrot_blue", 
                name: "Blue Mini Jouster", 
                description: "A tiny avian mount and rider.", 
                collected: false,
                source: {
                  text: "Achievement: Darkmoon Faire",
                  link: "https://www.wowhead.com/achievement=6021"
                }
              }
              // Additional pets would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}