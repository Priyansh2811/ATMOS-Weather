# Location service

`location.js` contains the real location layer for ATMOS.

- Open-Meteo Geocoding: city/country search.
- Browser Geolocation API: precise user-approved device coordinates.
- BigDataCloud free client-side reverse geocoding: GPS coordinates -> readable location.

The latitude/longitude selected here are ready for the next phase: fetching live weather from the forecast API.
