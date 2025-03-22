/**
 * State management utilities for the Astro version
 * Replaces the Svelte stores with client-side state management
 */

// User state
let userState = {
  region: undefined,
  realm: undefined,
  character: undefined,
  avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=", // default 1x1 for avatar
  page: undefined,
  category: undefined,
  subcat: undefined
};

// Preferences state
let preferencesState = {
  theme: 'light',
  itemSkin: 'classic',
  showHidden: 'hidden',
  showHiddenFeat: 'hidden',
  showUnobtainedOnly: 'false',
  showUpcoming: 'false'
};

// Subscribers for state changes
const userSubscribers = [];
const preferencesSubscribers = [];

// Initialize state from localStorage if available
export function initializeState() {
  if (typeof window === 'undefined') return; // Skip during SSR

  // Load user info from localStorage
  const storedRegion = localStorage.getItem('region');
  const storedRealm = localStorage.getItem('realm');
  const storedCharacter = localStorage.getItem('character');
  
  if (storedRegion && storedRealm && storedCharacter) {
    userState.region = storedRegion;
    userState.realm = storedRealm;
    userState.character = storedCharacter;
  }
  
  // Load preferences
  preferencesState.theme = localStorage.getItem('darkTheme') === 'true' ? 'dark' : 'light';
  preferencesState.itemSkin = localStorage.getItem('itemSkin') || 'classic';
  preferencesState.showHidden = localStorage.getItem('showHidden') || 'hidden';
  preferencesState.showHiddenFeat = localStorage.getItem('showHiddenFeat') || 'hidden';
  preferencesState.showUnobtainedOnly = localStorage.getItem('showUnobtainedOnly') || 'false';
  preferencesState.showUpcoming = localStorage.getItem('showUpcoming') || 'false';

  // Parse route for navigation state
  parseRouteFromHash();
  
  // Listen for hash changes
  window.addEventListener('hashchange', parseRouteFromHash, false);
}

// Parse hash-based routes
function parseRouteFromHash() {
  if (typeof window === 'undefined') return;
  
  const hash = window.document.location.hash;
  if (!hash || hash === '#/') return;
  
  const [, region, realm, character, page, category, subcat] = decodeURIComponent(hash).slice(1).split('/');
  
  userState.region = region;
  userState.realm = realm;
  userState.character = character;
  userState.page = page;
  userState.category = category;
  userState.subcat = subcat;
  
  notifyUserSubscribers();
  
  // Save to localStorage
  if (region && realm && character) {
    localStorage.setItem('region', region);
    localStorage.setItem('realm', realm);
    localStorage.setItem('character', character);
  }
}

// Update user state
export function updateUserState(updates) {
  userState = { ...userState, ...updates };
  notifyUserSubscribers();
}

// Update preferences state
export function updatePreferences(updates) {
  preferencesState = { ...preferencesState, ...updates };
  
  // Save to localStorage
  if (updates.theme) {
    localStorage.setItem('darkTheme', updates.theme === 'dark');
  }
  if (updates.itemSkin) {
    localStorage.setItem('itemSkin', updates.itemSkin);
  }
  if (updates.showHidden) {
    localStorage.setItem('showHidden', updates.showHidden);
  }
  if (updates.showHiddenFeat) {
    localStorage.setItem('showHiddenFeat', updates.showHiddenFeat);
  }
  if (updates.showUnobtainedOnly) {
    localStorage.setItem('showUnobtainedOnly', updates.showUnobtainedOnly);
  }
  if (updates.showUpcoming) {
    localStorage.setItem('showUpcoming', updates.showUpcoming);
  }
  
  notifyPreferencesSubscribers();
}

// Navigate to a new route
export function navigate(page = '', region = '', realm = '', character = '') {
  if (typeof window === 'undefined') return;
  
  let url = '#/';
  
  if (region) {
    url += `${region}/`;
    
    if (realm) {
      url += `${realm}/`;
      
      if (character) {
        url += `${character}/`;
        
        if (page) {
          url += `${page}`;
        }
      }
    }
  }
  
  window.document.location.hash = url;
}

// Get URL for navigation
export function getUrl(region, realm, character, page = '') {
  let url = '#/';
  
  if (region) {
    url += `${region}/`;
    
    if (realm) {
      url += `${realm}/`;
      
      if (character) {
        url += `${character}/`;
        
        if (page) {
          url += `${page}`;
        }
      }
    }
  }
  
  return url;
}

// Subscribe to user state changes
export function subscribeToUserState(callback) {
  userSubscribers.push(callback);
  return () => {
    const index = userSubscribers.indexOf(callback);
    if (index !== -1) {
      userSubscribers.splice(index, 1);
    }
  };
}

// Subscribe to preferences changes
export function subscribeToPreferences(callback) {
  preferencesSubscribers.push(callback);
  return () => {
    const index = preferencesSubscribers.indexOf(callback);
    if (index !== -1) {
      preferencesSubscribers.splice(index, 1);
    }
  };
}

// Notify subscribers of state changes
function notifyUserSubscribers() {
  userSubscribers.forEach(callback => callback(userState));
}

function notifyPreferencesSubscribers() {
  preferencesSubscribers.forEach(callback => callback(preferencesState));
}

// Get current state
export function getUserState() {
  return userState;
}

export function getPreferencesState() {
  return preferencesState;
}