/**
 * Utility functions for the Astro version of Simple Armory
 */

// Format title with character name
export function getTitle(character, section) {
  if (!character) {
    return section ? `${section} | Simple Armory` : 'Simple Armory';
  }
  return section ? `${character} | ${section} | Simple Armory` : `${character} | Simple Armory`;
}

// Calculate percentage
export function percent(collected, possible) {
  return Math.round((collected / possible) * 100);
}

// Format percentage for display
export function percentFormat(collected, possible) {
  return `${collected} / ${possible} (${percent(collected, possible)}%)`;
}

// Get WowHead URL
let wowheadUrl = 'wowhead.com';
export function getWowheadUrl() {
  // Use stored preference or default
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wowhead_url') || wowheadUrl;
  }
  return wowheadUrl;
}

// Set WowHead URL
export function setWowheadUrl(url) {
  wowheadUrl = url;
  if (typeof window !== 'undefined') {
    localStorage.setItem('wowhead_url', url);
  }
}

// Detect dark mode
export function getDarkMode(win, callback) {
  if (typeof window === 'undefined') return;
  
  // Check for stored preference
  const storedPreference = localStorage.getItem('darkTheme');
  if (storedPreference !== null) {
    callback(storedPreference === 'true');
    return;
  }

  // Check for system preference
  if (win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches) {
    callback(true);
    return;
  }

  callback(false);
}

// Apply theme class to body
export function applyTheme(isDark) {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

// Apply item skin class to body
export function applyItemSkin(isClassic) {
  if (typeof document === 'undefined') return;
  
  if (isClassic) {
    document.body.classList.add('itemSkinClassic');
    document.body.classList.remove('itemSkinNew');
  } else {
    document.body.classList.add('itemSkinNew');
    document.body.classList.remove('itemSkinClassic');
  }
}