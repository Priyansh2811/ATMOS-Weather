const KEY = "atmos-saved-locations-v1";

export function loadSavedLocations(fallback = []) {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocations(locations) {
  try {
    localStorage.setItem(KEY, JSON.stringify(locations));
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}
