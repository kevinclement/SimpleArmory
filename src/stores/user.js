import { writable, get } from "svelte/store";

export const region = writable(undefined);
export const realm = writable(undefined);
export const character = writable(undefined);
export const avatar = writable("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=");
export const page = writable(undefined);
export const category = writable(undefined);
export const subcat = writable(undefined);

// Persistent toggle: Hide completed steps
const HIDE_KEY = 'mountsPlannerHideCompleted';

function createHideCompletedStore() {
  let initial = false;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(HIDE_KEY);
      if (stored !== null) initial = stored === 'true';
    } catch {}
  }

  const store = writable(initial);

  store.subscribe(value => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HIDE_KEY, value);
    }
  });

  return store;
}
export const hideCompletedStore = createHideCompletedStore();


// // Persistent character-specific checked steps
// export function getCheckedAtStore(region, realm, character) {
//   if (region === undefined || realm === undefined || character === undefined) {
//     return;
//   }

//   const key = `mountsPlannerCheckedAt_${region}_${realm}_${character}`;
//   let initial = {};

//   if (typeof window !== 'undefined') {
//     try {
//       const stored = localStorage.getItem(key);
//       if (stored) initial = JSON.parse(stored);
//     } catch {}
//   }

//   const store = writable(initial);

//   store.subscribe(val => {
//     if (typeof window !== 'undefined') {
//       localStorage.setItem(key, JSON.stringify(val));
//     }
//   });

//   return store;
// }
