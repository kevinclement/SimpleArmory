import { register, init, getLocaleFromNavigator } from "svelte-i18n";

register("en", () => import("../locales/en.json"));
register("fr", () => import("../locales/fr.json"));

init({
  fallbackLocale: "en",
  initialLocale: "en",
});
