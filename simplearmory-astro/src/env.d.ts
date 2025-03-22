/// <reference types="astro/client" />

/**
 * TypeScript declarations for SimpleArmory Astro project
 */

interface ImportMetaEnv {
  // Define environment variables here
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Window interface for SimpleArmory global variables
interface Window {
  ga?: (command: string, hitType: string, ...fields: any[]) => void;
}

// Define SimpleArmory user state
interface User {
  region: string;
  realm: string;
  character: string;
}

// Define SimpleArmory preferences
interface Preferences {
  theme: 'light' | 'dark';
  itemSkin: 'classic' | 'new';
  showHidden: 'shown' | 'hidden';
  showHiddenFeat: 'shown' | 'hidden';
  showUnobtainedOnly: 'true' | 'false';
  showUpcoming: 'true' | 'false';
}

// Achievement interface
interface Achievement {
  id: string | number;
  name: string;
  description?: string;
  icon: string;
  points: number;
  completed?: string; // ISO date string
  accountWide?: boolean;
}

// Faction interface for reputation
interface Faction {
  id: number;
  name: string;
  standing: number;
  value: number;
  max: number;
  level: number;
  levels: Array<[number, string]>;
  perc: number;
  renown?: boolean;
}

// Mount interface
interface Mount {
  id: number;
  name: string;
  icon: string;
  collected: boolean;
  description?: string;
  source?: {
    text: string;
    link: string;
  };
}

// Companion interface
interface Companion {
  id: number;
  name: string;
  icon: string;
  collected: boolean;
  description?: string;
  source?: {
    text: string;
    link: string;
  };
}

// Toy interface
interface Toy {
  id: number;
  name: string;
  icon: string;
  collected: boolean;
  description?: string;
  source?: {
    text: string;
    link: string;
  };
}

// BattlePet interface
interface BattlePet {
  id: number;
  name: string;
  icon: string;
  collected: boolean;
  description?: string;
  currentLevel?: number;
  maxLevel?: number;
  qualityId?: number;
  breed?: string;
  source?: {
    text: string;
    link: string;
  };
}

// Title interface
interface Title {
  id: number;
  name: string;
  collected: boolean;
  description?: string;
  source?: {
    text: string;
    link: string;
  };
}

// Heirloom interface
interface Heirloom {
  id: number;
  name: string;
  icon: string;
  collected: boolean;
  description?: string;
  source?: {
    text: string;
    link: string;
  };
}