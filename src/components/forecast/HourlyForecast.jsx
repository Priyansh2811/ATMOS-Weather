import { useMemo, useState } from "react";
import Card from "../ui/Card";
import { weatherCodeToCondition, formatTemperature } from "../../services/weather";

export default function HourlyForecast({ weather, unit = "C", onRefresh }) {
  const [selected, setSelected] = useState(0);
  const items = useMemo(() => {
    if (!weather?.hourly || !weather?.current) return [];
    const { hourly } = weather;
    const currentTime = new Date(weather.current.time).getTime();
    const startIndex = Math.max(0, hourly.time.findIndex(time => new Date(time).getTime() >= currentTime));
    return hourly.time.slice(startIndex, startIndex + 10).map((time, offset) => {
      const index = startIndex + offset;
      const [condition, icon] = weatherCodeToCondition(hourly.weather_code[index]);
      return {
        time: offset === 0 ? "Now" : new Date(time).toLocaleTimeString([], { hour: "numeric" }),
        icon, temp: hourly.temperature_2m[index], condition,
        rain: hourly.precipitation_probability?.[index] ?? 0,
        wind: hourly.wind_speed_10m?.[index] ?? 0
      };
    });
  }, [weather]);

  if (!items.length) return null;
  const item = items[selected] || items[0];

  return (
    <Card title="Hourly Forecast" action={<button className="text-button" onClick={onRefresh}>Refresh</button>}>
      <div className="hourly-focus">
        <span>{item.condition}</span><b>{formatTemperature(item.temp, unit)}</b>
        <small>{Math.round(item.rain)}% precipitation · {Math.round(item.wind)} km/h wind</small>
      </div>
      <div className="hourly-list">
        {items.map((hour, index) => (
          <button className={`hour-item ${selected === index ? "selected" : ""}`} key={`${hour.time}-${index}`} onClick={() => setSelected(index)} title={`View ${hour.condition}`}>
            <span>{hour.time}</span><b>{hour.icon}</b><strong>{formatTemperature(hour.temp, unit)}</strong>
          </button>
        ))}
      </div>
    </Card>
  );
}
