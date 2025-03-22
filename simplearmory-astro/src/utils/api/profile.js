/**
 * Profile API utilities
 * Handles fetching character profile data from Blizzard API
 */

// Cache for profile data to avoid repeated requests
const profileCache = new Map();

/**
 * Get character profile data
 * @param {string} region - WoW region (us, eu, etc.)
 * @param {string} realm - Character realm
 * @param {string} character - Character name
 * @returns {Promise<object>} - Character profile data
 */
export async function getProfile(region, realm, character) {
  if (!region || !realm || !character) {
    throw new Error('Region, realm, and character are required');
  }

  // Create cache key
  const cacheKey = `${region}_${realm}_${character}`;

  // Check cache first
  if (profileCache.has(cacheKey)) {
    return profileCache.get(cacheKey);
  }

  try {
    // API endpoint
    const apiUrl = `/api/profile?region=${encodeURIComponent(region)}&realm=${encodeURIComponent(realm)}&character=${encodeURIComponent(character)}`;
    
    // Fetch profile data
    const response = await fetch(apiUrl);
    
    // Parse response
    if (!response.ok) {
      // Handle API error
      if (response.status === 404) {
        // Character not found
        window.document.location.hash = `#/error/404/${realm}/${character}`;
        return { status: 404, error: 'Character not found' };
      } else {
        // Other API error
        window.document.location.hash = `#/error/${response.status}/${realm}/${character}`;
        return { status: response.status, error: 'API error' };
      }
    }

    // Parse response data
    const profile = await response.json();
    
    // Cache the result
    profileCache.set(cacheKey, profile);
    
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // Handle network error
    window.document.location.hash = `#/error/network/${realm}/${character}`;
    return { status: 'network', error: error.message };
  }
}

/**
 * Clear profile cache
 * @param {string} region - WoW region (optional)
 * @param {string} realm - Character realm (optional)
 * @param {string} character - Character name (optional)
 */
export function clearProfileCache(region, realm, character) {
  if (region && realm && character) {
    // Clear specific character cache
    const cacheKey = `${region}_${realm}_${character}`;
    profileCache.delete(cacheKey);
  } else {
    // Clear all cache
    profileCache.clear();
  }
}