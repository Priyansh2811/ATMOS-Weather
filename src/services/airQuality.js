const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function fetchAirQuality(location, signal) {
  const url = new URL(AIR_URL);
  url.searchParams.set("latitude", location.latitude);
  url.searchParams.set("longitude", location.longitude);
  url.searchParams.set(
    "current",
    "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
  );
  url.searchParams.set(
    "hourly",
    "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Air quality service is unavailable.");
  return response.json();
}

export function aqiLabel(aqi) {
  if (aqi == null) return "Unavailable";
  if (aqi <= 20) return "Good";
  if (aqi <= 40) return "Fair";
  if (aqi <= 60) return "Moderate";
  if (aqi <= 80) return "Poor";
  if (aqi <= 100) return "Very Poor";
  return "Extremely Poor";
}

export function aqiClass(aqi) {
  if (aqi == null) return "unknown";
  if (aqi <= 20) return "good";
  if (aqi <= 40) return "fair";
  if (aqi <= 60) return "moderate";
  if (aqi <= 80) return "poor";
  if (aqi <= 100) return "very-poor";
  return "extreme";
}
