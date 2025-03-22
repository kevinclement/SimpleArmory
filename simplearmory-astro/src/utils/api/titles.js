/**
 * Titles API utilities
 * Handles fetching title data from the API
 */

// Cache for titles data to avoid repeated requests
const titlesCache = new Map();

/**
 * Get titles for a character
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Titles data
 */
export async function getTitles(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (titlesCache.has(cacheKey)) {
    return titlesCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/titles?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch titles data
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch titles: ${response.status} ${response.statusText}`);
    }

    // Parse response data
    const titles = await response.json();
    
    // Cache the result
    titlesCache.set(cacheKey, titles);
    
    return titles;
  } catch (error) {
    console.error('Error fetching titles:', error);
    throw error;
  }
}

/**
 * Clear titles cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearTitlesCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    titlesCache.delete(cacheKey);
  } else {
    // Clear all cache
    titlesCache.clear();
  }
}

/**
 * Get mock titles data for development/testing
 * This can be used during development when the API is not available
 * @returns {object} - Mock titles data
 */
export function getMockTitles() {
  return {
    collected: 45,
    possible: 120,
    categories: [
      {
        name: "General",
        subcats: [
          {
            name: "General",
            titles: [
              { 
                id: 1,
                name: "%s the Patient", 
                description: "Earned by completing the achievement ' 100 Dungeon & Raid Emblems'.", 
                collected: true,
                source: {
                  text: "Achievement: 100 Dungeon & Raid Emblems",
                  link: "https://www.wowhead.com/achievement=2336"
                }
              },
              { 
                id: 2,
                name: "%s the Kingslayer", 
                description: "Earned by defeating the Lich King in Icecrown Citadel.", 
                collected: false,
                source: {
                  text: "Achievement: Fall of the Lich King",
                  link: "https://www.wowhead.com/achievement=4530"
                }
              }
              // Additional titles would be listed here in a real implementation
            ]
          }
        ]
      },
      {
        name: "Player versus Player",
        subcats: [
          {
            name: "Arena",
            titles: [
              { 
                id: 42,
                name: "Gladiator %s", 
                description: "Earned by finishing in the top 0.5% of the arena ladder at the end of a season.", 
                collected: true,
                source: {
                  text: "PvP: Arena Season Reward",
                  link: "https://www.wowhead.com/title=42"
                }
              }
              // Additional titles would be listed here in a real implementation
            ]
          },
          {
            name: "Battlegrounds",
            titles: [
              { 
                id: 15,
                name: "%s, Conqueror of Naxxramas", 
                description: "Earned by completing the achievement 'The Undying'.", 
                collected: false,
                source: {
                  text: "Achievement: The Undying",
                  link: "https://www.wowhead.com/achievement=2187"
                }
              }
              // Additional titles would be listed here in a real implementation
            ]
          }
        ]
      }
    ]
  };
}