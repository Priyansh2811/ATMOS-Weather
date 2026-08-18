import { useEffect, useRef } from "react";
import { Crosshair, LoaderCircle, MapPin, Search, X } from "lucide-react";

export default function Topbar({
  query,
  onQueryChange,
  results,
  onSelect,
  onUseCurrentLocation,
  locating,
  locationError,
  actions
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (event.key === "Escape") {
        inputRef.current?.blur();
      }
    };
    const focusSearch = () => inputRef.current?.focus();
    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("atmos:focus-search", focusSearch);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("atmos:focus-search", focusSearch);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="search-area">
        <div className="search-box">
          <Search size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search city, country or location..."
            aria-label="Search location"
            autoComplete="off"
          />
          {query ? (
            <button className="search-clear" onClick={() => onQueryChange("")} aria-label="Clear search">
              <X size={15} />
            </button>
          ) : <kbd>Ctrl K</kbd>}

          {results.length > 0 && (
            <div className="search-results">
              {results.map((result) => (
                <button key={`${result.id}-${result.latitude}`} onClick={() => onSelect(result)}>
                  <MapPin size={16} />
                  <span>
                    <strong>{result.name}</strong>
                    <small>{[result.admin1, result.country].filter(Boolean).join(", ")}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && results.length === 0 && (
            <div className="search-empty"></div>
          )}
        </div>

        <button className="location-button" onClick={onUseCurrentLocation} disabled={locating} title="Use my current location">
          {locating ? <LoaderCircle size={18} className="spin" /> : <Crosshair size={18} />}
          <span>{locating ? "Locating..." : "Use my location"}</span>
        </button>

        {locationError && <div className="location-error">{locationError}</div>}
      </div>
      <div className="topbar-actions">{actions}</div>
    </header>
  );
}
