import { useMemo } from "react";
import { weatherCodeToCondition } from "../../services/weather";

function sceneType(code, isDay) {
  if (code >= 95) return "storm";
  if (code >= 80) return "rain";
  if (code >= 71) return "snow";
  if (code >= 45) return "fog";
  if (code >= 1 && code <= 3) return "cloud";
  return isDay ? "clear-day" : "clear-night";
}

export default function WeatherScene({ weather }) {
  const current = weather?.current;
  const type = useMemo(() => sceneType(current?.weather_code ?? 0, current?.is_day ?? 1), [current?.weather_code, current?.is_day]);
  const [, icon] = weatherCodeToCondition(current?.weather_code ?? 0);
  const particleCount = type === "snow" ? 20 : type === "storm" ? 26 : type === "rain" ? 18 : 0;

  return (
    <div className={`weather-scene scene-${type}`} aria-hidden="true">
      <div className="scene-haze" />
      <div className="scene-sun">{type === "clear-day" ? "☀" : ""}</div>
      <div className="scene-moon">{type === "clear-night" ? "☾" : ""}</div>
      <div className="scene-stars">{Array.from({ length: 15 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</div>
      <div className="scene-cloud cloud-a">☁</div>
      <div className="scene-cloud cloud-b">☁</div>
      <div className="scene-cloud cloud-c">☁</div>
      <div className="scene-main-icon">{icon}</div>
      <div className="scene-particles">
        {Array.from({ length: particleCount }, (_, i) => <i key={i} style={{ "--i": i }} />)}
      </div>
      {type === "storm" && <div className="lightning" />}
      {type === "fog" && <><div className="fog-layer fog-one" /><div className="fog-layer fog-two" /></>}
    </div>
  );
}
