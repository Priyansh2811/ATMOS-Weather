import {
  Home, Search, Map, CalendarDays, Moon, Leaf, Heart, Bell, Settings, Sun, ChevronRight
} from "lucide-react";

const items = [
  [Home, "Home"], [Search, "Search"], [Map, "Map"], [CalendarDays, "Forecast"],
  [Moon, "Moon"], [Leaf, "Air Quality"], [Heart, "Saved Locations"],
  [Bell, "Alerts"], [Settings, "Settings"]
];

export default function Sidebar({ active, onNavigate, unit = "C" }) {
  return (
    <aside className="sidebar">
      <button className="brand brand-button" onClick={() => onNavigate("Home")} aria-label="Go to ATMOS home">ATMOS</button>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {items.map(([Icon, label]) => (
          <button
            key={label}
            className={`nav-item ${active === label ? "active" : ""}`}
            onClick={() => onNavigate(label)}
            title={label}
          >
            <Icon size={19} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="unit-switch" aria-label="Temperature units">
        <button className={unit === "C" ? "selected" : ""} onClick={() => window.dispatchEvent(new CustomEvent("atmos:set-unit",{detail:"C"}))}>°C</button>
        <button className={unit === "F" ? "selected" : ""} onClick={() => window.dispatchEvent(new CustomEvent("atmos:set-unit",{detail:"F"}))}>°F</button>
      </div>

      <button className="mode-chip" onClick={() => onNavigate("Settings")} title="Open settings">
        <Sun size={17} />
        <span>Light Mode</span>
        <ChevronRight size={15} />
      </button>
    </aside>
  );
}
