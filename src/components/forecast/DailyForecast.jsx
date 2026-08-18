import { useMemo, useState } from "react";
import Card from "../ui/Card";
import { weatherCodeToCondition, formatTemperature } from "../../services/weather";

export default function DailyForecast({ days = 5, onDaysChange, compact = false, weather, unit = "C" }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const data = useMemo(() => {
    if (!weather?.daily) return [];
    const { daily } = weather;
    const limit = compact ? 5 : days;
    return daily.time.slice(0, limit).map((date, index) => {
      const [condition, icon] = weatherCodeToCondition(daily.weather_code[index]);
      const dayDate = new Date(`${date}T12:00:00`);
      return {
        date, day: index === 0 ? "Today" : dayDate.toLocaleDateString([], { weekday: "short" }),
        dateLabel: dayDate.toLocaleDateString([], { day: "numeric", month: "short" }), icon, condition,
        min: daily.temperature_2m_min[index], max: daily.temperature_2m_max[index],
        rainProbability: Math.round(daily.precipitation_probability_max[index] ?? 0),
        rain: daily.precipitation_sum[index] ?? 0
      };
    });
  }, [weather, days, compact]);

  if (!data.length) return null;

  if (compact) return (
    <Card title="5-Day Forecast" action={<button className="text-button" onClick={() => onDaysChange?.(5)}>View</button>}>
      <div className="compact-forecast">
        {data.map((item) => <button className={`compact-day ${selectedDate === item.date ? "active" : ""}`} key={item.date} onClick={() => setSelectedDate(item.date)}>
          <div><strong>{item.day}</strong><small>{item.dateLabel}</small></div><b title={item.condition}>{item.icon}</b>
          <span>{formatTemperature(item.min, unit)}</span><i></i><strong>{formatTemperature(item.max, unit)}</strong>
        </button>)}
      </div>
    </Card>
  );

  const selected = data.find(item => item.date === selectedDate);

  return (
    <Card title="10-Day Forecast" action={<div className="forecast-toggle">
      <button className={days === 5 ? "active" : ""} onClick={() => onDaysChange(5)}>5 Days</button>
      <button className={days === 10 ? "active" : ""} onClick={() => onDaysChange(10)}>10 Days</button>
    </div>}>
      <div className="daily-grid">
        {data.map(item => <button className={`daily-item ${selectedDate === item.date ? "selected" : ""}`} key={item.date} onClick={() => setSelectedDate(item.date)} title={item.condition}>
          <strong>{item.day}</strong><small>{item.dateLabel}</small><b>{item.icon}</b>
          <div><span>{formatTemperature(item.min, unit)}</span><i></i><strong>{formatTemperature(item.max, unit)}</strong></div>
        </button>)}
      </div>
      {selected && <div className="forecast-detail">
        <div><b>{selected.day}, {selected.dateLabel}</b><span>{selected.condition}</span></div>
        <div><strong>{formatTemperature(selected.max, unit)}</strong><span>High</span></div>
        <div><strong>{formatTemperature(selected.min, unit)}</strong><span>Low</span></div>
        <div><strong>{selected.rainProbability}%</strong><span>Rain chance</span></div>
        <div><strong>{selected.rain.toFixed(1)} mm</strong><span>Precipitation</span></div>
      </div>}
    </Card>
  );
}
