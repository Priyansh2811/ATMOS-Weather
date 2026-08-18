const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export async function searchLocations(query, signal) {
  const name = query.trim();
  if (name.length < 2) return [];

  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Location search failed.");

  const data = await response.json();
  return (data.results || []).map((item) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    countryCode: item.country_code,
    admin1: item.admin1 || "",
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone || "auto"
  }));
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
      ...options
    });
  });
}

export async function reverseGeocode(latitude, longitude, signal) {
  const url = new URL(REVERSE_URL);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("localityLanguage", "en");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Could not identify this location.");

  const data = await response.json();

  return {
    id: `current-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    name: data.city || data.locality || data.principalSubdivision || "Current location",
    country: data.countryName || "",
    countryCode: data.countryCode || "",
    admin1: data.principalSubdivision || "",
    latitude,
    longitude,
    timezone: data.localityInfo?.informative?.find(
      (item) => item.description === "time zone" || item.name === "time zone"
    )?.name || "auto"
  };
}

export async function detectCurrentLocation() {
  const position = await getCurrentPosition();
  const { latitude, longitude } = position.coords;
  return reverseGeocode(latitude, longitude);
}

export function formatLocation(location) {
  if (!location) return "Select a location";
  const parts = [location.name];

  if (location.admin1 && location.admin1 !== location.name) {
    parts.push(location.admin1);
  }

  if (location.country) parts.push(location.country);
  return parts.join(", ");
}
