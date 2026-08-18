import { Navigation, Sun } from "lucide-react";
import Card from "../ui/Card";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function MiniCard({ title, children }) {
  return <Card title={title}>{children}</Card>;
}

export default function WeatherDetailCards({ weather }) {
  if (!weather?.daily || !weather?.hourly || !weather?.current) return null;

  const { daily, hourly, current } = weather;

  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];
  const daylightSeconds = daily.daylight_duration?.[0] ?? 0;
  const daylightHours = Math.floor(daylightSeconds / 3600);
  const daylightMinutes = Math.round((daylightSeconds % 3600) / 60);

  const currentTime = new Date(current.time).getTime();
  const startIndex = Math.max(0, hourly.time.findIndex(
    (time) => new Date(time).getTime() >= currentTime
  ));
  const rainValues = hourly.precipitation.slice(startIndex, startIndex + 8);
  const maxRain = Math.max(...rainValues, 0.1);

  return (
    <div className="detail-grid">
      <MiniCard title="Sunrise & Sunset">
        <div className="sun-visual"><Sun size={22} /><div className="sun-arc"></div></div>
        <div className="three-values">
          <span>Sunrise<strong>{formatTime(sunrise)}</strong></span>
          <span>Daylight<strong>{daylightHours}h {daylightMinutes}m</strong></span>
          <span>Sunset<strong>{formatTime(sunset)}</strong></span>
        </div>
      </MiniCard>

      <MiniCard title="Precipitation">
        <div className="precipitation-bars">
          {rainValues.map((value, index) => (
            <i
              style={{ height: `${Math.max(5, (value / maxRain) * 55)}px` }}
              title={`${Number(value).toFixed(1)} mm`}
              key={index}
            ></i>
          ))}
        </div>
        <div className="chart-axis"><span>Now</span><span>+4h</span><span>+8h</span></div>
      </MiniCard>

      <MiniCard title="Wind Status">
        <div className="wind-status">
          <Navigation size={43} style={{ transform: `rotate(${current.wind_direction_10m}deg)` }} />
          <div><strong>{Math.round(current.wind_speed_10m)}</strong><span>km/h</span></div>
        </div>
        <p className="small-note">Gusts <b>{Math.round(current.wind_gusts_10m)} km/h</b></p>
      </MiniCard>

      <MiniCard title="UV Index">
        <div className="uv-ring"><strong>{Math.round(current.uv_index ?? 0)}</strong><span>{uvLabel(current.uv_index)}</span></div>
        <p className="small-note centered">UV conditions are based on the live forecast.</p>
      </MiniCard>
    </div>
  );
}

function uvLabel(value = 0) {
  if (value <= 2) return "Low";
  if (value <= 5) return "Moderate";
  if (value <= 7) return "High";
  if (value <= 10) return "Very High";
  return "Extreme";
}
