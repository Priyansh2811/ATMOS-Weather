# ATMOS — Weather Intelligence Dashboard

ATMOS is a lightweight, responsive weather dashboard built with React + Vite.

## Features

### Location
- Global city/country search
- Browser GPS current-location detection
- Reverse geocoding
- Saved locations in browser localStorage

### Live weather
- Current temperature and feels-like temperature
- Humidity
- Pressure
- Visibility
- Cloud cover
- Wind speed, direction and gusts
- Precipitation
- UV index
- Weather condition mapping
- Hourly forecast
- 5-day and 10-day forecast
- Sunrise, sunset and daylight duration

### Air quality
- European AQI
- PM2.5
- PM10
- Ozone

### Live weather animation
- Animated clear daytime sun
- Animated night moon and stars
- Drifting clouds
- Rain particles
- Snow particles
- Thunderstorm rain + lightning flashes
- Fog/mist layers
- Weather-code driven scene selection
- Reduced-motion accessibility support
- Automatic weather refresh every 10 minutes

### Astronomy
- Moon phase
- Illumination
- Approximate moonrise/moonset UI values

## Tech stack

- React
- Vite
- JavaScript
- Lucide React
- Open-Meteo Forecast API
- Open-Meteo Air Quality API
- Open-Meteo Geocoding API
- Browser Geolocation API
- BigDataCloud reverse geocoding
- localStorage

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open **Settings → Pages**.
3. Select **GitHub Actions** as the source.
4. Add a Vite/GitHub Pages deployment workflow if your repository does not already have one.
5. Build the project with `npm run build` and publish the `dist` directory.

If you deploy under a repository subpath rather than a custom domain, set the Vite `base` option to your repository name.

## Data and usage

ATMOS uses Open-Meteo for weather and air-quality data. The free Open-Meteo API is intended for non-commercial use and has request limits. Open-Meteo data are licensed under CC BY 4.0, so the application includes visible attribution.

For a commercial/public high-volume product, review Open-Meteo's current licensing and pricing before deployment.

## Project structure

```text
src/
├── components/
│   ├── air/
│   ├── astronomy/
│   ├── forecast/
│   ├── layout/
│   ├── location/
│   ├── ui/
│   └── weather/
├── data/
├── services/
│   ├── airQuality.js
│   ├── location.js
│   ├── moon.js
│   ├── storage.js
│   └── weather.js
├── App.jsx
├── main.jsx
└── styles/
    └── index.css
```

## Credits

Weather and air-quality data: Open-Meteo.com.
Location search: Open-Meteo Geocoding API.
Reverse geocoding: BigDataCloud client-side reverse geocoder.

This project is a portfolio/demo application and does not guarantee forecast accuracy.

## Interactive workflow

- Sidebar navigation smoothly scrolls to the relevant dashboard section.
- Search opens with `Ctrl/Cmd + K`, location suggestions are clickable, and search can be cleared.
- Current-location detection uses browser GPS permission.
- The temperature unit switch changes the dashboard between Celsius and Fahrenheit and persists locally.
- The sun/moon button switches light/dark theme and persists locally.
- Settings opens a working preferences dialog with unit and auto-refresh controls.
- Map opens a live OpenStreetMap view centered on the selected location.
- Alerts generates condition-aware notices from the live weather response.
- Hourly forecast cards are clickable and show the selected hour's details.
- Daily forecast cards are clickable and show a compact detail row.
- Save location toggles the selected location in browser storage.
- Refresh controls re-fetch live weather and air quality immediately.
- Weather animation stays contained inside the main weather card and adapts to clear, cloudy, rain, snow, fog and thunderstorm conditions.
