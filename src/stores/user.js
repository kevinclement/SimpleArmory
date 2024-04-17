import { writable } from "svelte/store"

export const region = writable(undefined);
export const realm = writable(undefined);
export const character = writable(undefined);
export const avatar = writable("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="); // default to 1x1 for avatar
export const page = writable(undefined);
export const category = writable(undefined);
export const subcat = writable(undefined);
