const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const CURRENT = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "pressure_msl",
  "surface_pressure",
  "cloud_cover",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "visibility",
  "uv_index",
  "dew_point_2m",
  "is_day"
];

const HOURLY = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation_probability",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "weather_code",
  "cloud_cover",
  "visibility",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "uv_index",
  "dew_point_2m",
  "is_day"
];

const DAILY = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_sum",
  "rain_sum",
  "showers_sum",
  "snowfall_sum",
  "precipitation_probability_max",
  "precipitation_hours",
  "sunrise",
  "sunset",
  "daylight_duration",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "wind_direction_10m_dominant",
  "uv_index_max"
];

export async function fetchWeather(location, signal) {
  if (!location?.latitude || !location?.longitude) {
    throw new Error("A valid latitude and longitude are required.");
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", location.latitude);
  url.searchParams.set("longitude", location.longitude);
  url.searchParams.set("current", CURRENT.join(","));
  url.searchParams.set("hourly", HOURLY.join(","));
  url.searchParams.set("daily", DAILY.join(","));
  url.searchParams.set("forecast_days", "10");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("precipitation_unit", "mm");

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Live weather service is unavailable right now.");
  }

  return response.json();
}

export function weatherCodeToCondition(code) {
  const map = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Rime Fog", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],
    56: ["Freezing Drizzle", "🌧️"],
    57: ["Heavy Freezing Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    66: ["Freezing Rain", "🌧️"],
    67: ["Heavy Freezing Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "🌨️"],
    75: ["Heavy Snow", "❄️"],
    77: ["Snow Grains", "❄️"],
    80: ["Light Showers", "🌦️"],
    81: ["Showers", "🌧️"],
    82: ["Heavy Showers", "🌧️"],
    85: ["Snow Showers", "🌨️"],
    86: ["Heavy Snow Showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm + Hail", "⛈️"],
    99: ["Severe Thunderstorm + Hail", "⛈️"]
  };

  return map[code] || ["Unknown", "🌤️"];
}

export function degreesToCompass(degrees = 0) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

export function getNearestHourIndex(times, currentTime) {
  if (!times?.length) return 0;
  const target = new Date(currentTime).getTime();

  let bestIndex = 0;
  let bestDistance = Infinity;

  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function getWeatherPresentation(weather) {
  const current = weather.current;
  const [condition, icon] = weatherCodeToCondition(current.weather_code);

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    pressure: Math.round(current.pressure_msl),
    precipitation: current.precipitation ?? 0,
    rain: current.rain ?? 0,
    showers: current.showers ?? 0,
    snowfall: current.snowfall ?? 0,
    condition,
    icon,
    cloudCover: Math.round(current.cloud_cover),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: degreesToCompass(current.wind_direction_10m),
    windDegrees: Math.round(current.wind_direction_10m),
    gusts: Math.round(current.wind_gusts_10m),
    visibility: current.visibility != null ? (current.visibility / 1000).toFixed(1) : "—",
    uv: current.uv_index != null ? Math.round(current.uv_index) : "—",
    isDay: Boolean(current.is_day)
  };
}

export function formatTemperature(celsius, unit = "C") {
  const value = unit === "F" ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(value)}°`;
}
