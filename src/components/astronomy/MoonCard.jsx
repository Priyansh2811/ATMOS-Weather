import Card from "../ui/Card";
import { getMoonPhase, getApproxMoonTimes } from "../../services/moon";

export default function MoonCard({ location }) {
  const now = new Date();
  const moon = getMoonPhase(now);
  const times = getApproxMoonTimes(now, location?.latitude, location?.longitude);

  if (!location?.latitude || !location?.longitude) {
    return null;
  }

  return (
    <Card title="Moon" action={<span className="live-pill">Live</span>}>
      <div className="moon-card">
        <div className="moon-visual">{moon.emoji}</div>
        <div className="moon-copy">
          <strong>{moon.name}</strong>
          <span>{moon.illumination}% illuminated</span>
          <div className="moon-meta">
            <span>Moonrise <b>{times.rise}</b></span>
            <span>Moonset <b>{times.set}</b></span>
          </div>
        </div>
      </div>
    </Card>
  );
}
