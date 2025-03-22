/**
 * URL utility functions for the Astro version
 */

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

// Navigate to a URL
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

// Parse URL hash components
export function parseUrlHash() {
  if (typeof window === 'undefined') return {};
  
  const hash = window.document.location.hash;
  if (!hash || hash === '#/' || hash === '#') {
    return {};
  }
  
  const [, region, realm, character, page, category, subcat] = decodeURIComponent(hash).slice(1).split('/');
  
  return { region, realm, character, page, category, subcat };
}

// Get armory URL for a character
export function getArmoryUrl(region, realm, character) {
  if (!region || !realm || !character) return '';
  return `https://worldofwarcraft.com/character/${region}/${realm}/${character.toLowerCase()}`;
}