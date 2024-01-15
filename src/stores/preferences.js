import { writable } from "svelte/store"

export const preferences = writable({ theme: 'light', itemSkin: 'classic' });