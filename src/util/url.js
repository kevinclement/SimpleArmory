import settings from "./settings";

export function getUrl(region, realm, character, subSite) {
  let url = "#" + getBaseUrl(region, realm, character);
  if (subSite && subSite !== "") {
    url += "/" + subSite;
  }

  return url;
}

export function getBaseUrl(region, realm, character) {
  if (!character) {
    return "";
  }

  return "/" + region.toLowerCase() + "/" + realm.toLowerCase() + "/" + character.toLowerCase();
}

export function navigate(path, region, realm, character) {
  if (!window || !window.document) return;

  if (region && realm && character) {
    window.document.location.hash = getUrl(region, realm, character, path);
  } else {
    window.document.location.hash = "#/";
  }
}

export function getWowHeadUrl(locale) {
  return `//${locale.substring(0, 2)}.${settings.WowHeadUrl}`;
}
