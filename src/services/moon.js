const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function getMoonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phase = age / SYNODIC_MONTH;

  let name;
  if (phase < 0.033 || phase >= 0.967) name = "New Moon";
  else if (phase < 0.22) name = "Waxing Crescent";
  else if (phase < 0.28) name = "First Quarter";
  else if (phase < 0.47) name = "Waxing Gibbous";
  else if (phase < 0.53) name = "Full Moon";
  else if (phase < 0.72) name = "Waning Gibbous";
  else if (phase < 0.78) name = "Last Quarter";
  else name = "Waning Crescent";

  const illumination = Math.round(
    ((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100
  );

  return {
    age,
    phase,
    name,
    illumination,
    emoji: moonEmoji(phase)
  };
}

function moonEmoji(phase) {
  if (phase < 0.033 || phase >= 0.967) return "🌑";
  if (phase < 0.22) return "🌒";
  if (phase < 0.28) return "🌓";
  if (phase < 0.47) return "🌔";
  if (phase < 0.53) return "🌕";
  if (phase < 0.72) return "🌖";
  if (phase < 0.78) return "🌗";
  return "🌘";
}

export function getApproxMoonTimes(date = new Date(), latitude = 0, longitude = 0) {
  // Lightweight visual-app approximation. Exact rise/set requires a dedicated
  // astronomical ephemeris; this gives stable UI values without another API.
  const phase = getMoonPhase(date).phase;
  const riseHour = (18 + phase * 24 + longitude / 15) % 24;
  const setHour = (riseHour + 12) % 24;

  return {
    rise: hourToTime(riseHour),
    set: hourToTime(setHour)
  };
}

function hourToTime(decimal) {
  const normalized = (decimal + 24) % 24;
  const hours = Math.floor(normalized);
  const minutes = Math.round((normalized - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
