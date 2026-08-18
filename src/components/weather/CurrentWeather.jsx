import { Cloud, CloudRain, Droplets, Eye, Gauge, LoaderCircle, Umbrella, Wind, Sun } from "lucide-react";
import Card from "../ui/Card";
import WeatherScene from "./WeatherScene";
import { formatTemperature } from "../../services/weather";

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={18} strokeWidth={1.7} />
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

export default function CurrentWeather({ location, weather, loading, error, unit = "C" }) {
  if (loading && !weather) {
    return <Card className="current-weather-card loading-card"><div className="weather-loading">
      <LoaderCircle className="spin" size={28} /><strong>Loading live weather...</strong>
      <span>Fetching conditions for {location?.name || "your location"}</span>
    </div></Card>;
  }

  if (error && !weather) {
    return <Card className="current-weather-card"><div className="weather-error">
      <strong>Weather data could not be loaded</strong><span>{error}</span>
    </div></Card>;
  }

  if (!weather || !weather.current || !weather.presentation) {
    return <Card className="current-weather-card"><div className="weather-error">
      <strong>Weather data is not available yet.</strong>
      <span>Please try refreshing in a moment.</span>
    </div></Card>;
  }

  const current = weather.current;
  const condition = weather.presentation;
  const locationLabel = [location?.name, location?.admin1 && location.admin1 !== location?.name ? location.admin1 : "", location?.country].filter(Boolean).join(", ");
  const sunrise = weather.daily?.sunrise?.[0];
  const sunset = weather.daily?.sunset?.[0];
  const formattedTime = new Date(current.time).toLocaleString([], {
    weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
  });
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";

  return (
    <Card className="current-weather-card">
      <WeatherScene weather={weather} />
      <div className="current-weather">
        <div className="current-copy">
          <div className="current-location">⌖ {locationLabel || "Current location"}</div>
          <p className="muted">{formattedTime} · Live weather</p>
          <div className="temperature">{formatTemperature(current.temperature_2m, unit)}<span></span></div>
          <div className="condition">{condition.condition}</div>
          <p className="muted">Feels like {formatTemperature(current.apparent_temperature, unit)}</p>
          <div className="live-badges">
            <span>Sunrise {formatTime(sunrise)}</span>
            <span>Sunset {formatTime(sunset)}</span>
          </div>
        </div>

        <div className="weather-illustration" aria-hidden="true">
          <div className="cloud-emoji">{condition.icon}</div>
        </div>

        <div className="metrics-grid">
          <Metric icon={Droplets} label="Humidity" value={`${condition.humidity}%`} />
          <Metric icon={Gauge} label="Pressure" value={`${condition.pressure} hPa`} />
          <Metric icon={Umbrella} label="Precipitation" value={`${condition.precipitation.toFixed(1)} mm`} />
          <Metric icon={Eye} label="Visibility" value={`${condition.visibility} km`} />
          <Metric icon={Wind} label="Wind" value={`${condition.windSpeed} km/h ${condition.windDirection}`} />
          <Metric icon={Cloud} label="Cloud Cover" value={`${condition.cloudCover}%`} />
          <Metric icon={Sun} label="UV Index" value={`${condition.uv}`} />
          <Metric icon={CloudRain} label="Dew Point" value={formatTemperature(current.dew_point_2m ?? condition.feelsLike, unit)} />
        </div>
      </div>
    </Card>
  );
}
