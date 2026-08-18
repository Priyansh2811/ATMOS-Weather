import Card from "../ui/Card";
import { aqiLabel, aqiClass } from "../../services/airQuality";

export default function AirQualityCard({ airQuality, loading, error }) {
  if (loading && !airQuality) {
    return (
      <Card title="Air Quality">
        <div className="air-loading">Loading live air quality...</div>
      </Card>
    );
  }

  if (error && !airQuality) {
    return (
      <Card title="Air Quality">
        <div className="air-loading">{error}</div>
      </Card>
    );
  }

  const current = airQuality?.current;
  const aqi = current?.european_aqi;

  return (
    <Card title="Air Quality" action={<span className={`aqi-badge ${aqiClass(aqi)}`}>{aqiLabel(aqi)}</span>}>
      <div className="air-quality-main">
        <div className={`aqi-number ${aqiClass(aqi)}`}>{aqi ?? "—"}</div>
        <div>
          <strong>European AQI</strong>
          <span>Live atmospheric conditions</span>
        </div>
      </div>
      <div className="pollutants">
        <span>PM2.5 <b>{current?.pm2_5 != null ? `${Math.round(current.pm2_5)} μg/m³` : "—"}</b></span>
        <span>PM10 <b>{current?.pm10 != null ? `${Math.round(current.pm10)} μg/m³` : "—"}</b></span>
        <span>O₃ <b>{current?.ozone != null ? `${Math.round(current.ozone)} μg/m³` : "—"}</b></span>
      </div>
    </Card>
  );
}
