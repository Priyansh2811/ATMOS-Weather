import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Sun, Moon as MoonIcon, MapPinned, X, RefreshCw, Bell, CheckCircle2 } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import CurrentWeather from "./components/weather/CurrentWeather";
import HourlyForecast from "./components/forecast/HourlyForecast";
import DailyForecast from "./components/forecast/DailyForecast";
import WeatherDetailCards from "./components/weather/WeatherDetailCards";
import MoonCard from "./components/astronomy/MoonCard";
import AirQualityCard from "./components/air/AirQualityCard";
import SavedLocations from "./components/location/SavedLocations";
import { detectCurrentLocation, formatLocation, searchLocations } from "./services/location";
import { fetchWeather, formatTemperature, getWeatherPresentation } from "./services/weather";
import { fetchAirQuality } from "./services/airQuality";
import { loadSavedLocations, saveLocations } from "./services/storage";

const DEFAULT_LOCATION = { id:"default-india", name:"India", country:"India", admin1:"", latitude:22.5937, longitude:78.9629, timezone:"Asia/Kolkata" };

function locationKey(location){ return `${Number(location.latitude).toFixed(4)},${Number(location.longitude).toFixed(4)}`; }

export default function App(){
  const [active,setActive]=useState("Home");
  const [days,setDays]=useState(5);
  const [query,setQuery]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [selectedLocation,setSelectedLocation]=useState(DEFAULT_LOCATION);
  const [saved,setSaved]=useState(()=>loadSavedLocations([]));
  const [locating,setLocating]=useState(false);
  const [locationError,setLocationError]=useState("");
  const [weather,setWeather]=useState(null);
  const [weatherLoading,setWeatherLoading]=useState(true);
  const [weatherError,setWeatherError]=useState("");
  const [airQuality,setAirQuality]=useState(null);
  const [airLoading,setAirLoading]=useState(true);
  const [airError,setAirError]=useState("");
  const [lastUpdated,setLastUpdated]=useState(null);
  const [unit,setUnit]=useState(()=>localStorage.getItem("atmos-unit")||"C");
  const [themeMode,setThemeMode]=useState(()=>localStorage.getItem("atmos-theme-mode")||"auto");
  const [modal,setModal]=useState(null);
  const [autoRefresh,setAutoRefresh]=useState(true);
  const [toast,setToast]=useState("");

  const searchController=useRef(null), weatherController=useRef(null), airController=useRef(null);

  const resolvedTheme = useMemo(() => {
    if (themeMode === "light") return "light";
    if (themeMode === "dark") return "dark";
    if (!weather?.current) return "light";
    return weather.current.is_day ? "light" : "dark";
  }, [themeMode, weather]);

  useEffect(()=>{ document.documentElement.dataset.theme=resolvedTheme; localStorage.setItem("atmos-theme",resolvedTheme); localStorage.setItem("atmos-theme-mode",themeMode); },[resolvedTheme, themeMode]);
  useEffect(()=>{ const h=e=>setUnit(e.detail); window.addEventListener("atmos:set-unit",h); return()=>window.removeEventListener("atmos:set-unit",h); },[]);
  useEffect(()=>{ localStorage.setItem("atmos-unit",unit); },[unit]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),2600); return()=>clearTimeout(t); },[toast]);

  useEffect(()=>{
    const value=query.trim();
    if(value.length<2){setSearchResults([]);searchController.current?.abort();return;}
    const timer=setTimeout(async()=>{
      searchController.current?.abort();
      const controller=new AbortController();searchController.current=controller;
      try{setSearchResults(await searchLocations(value,controller.signal));}
      catch(e){if(e.name!=="AbortError")setSearchResults([]);}
    },260);
    return()=>clearTimeout(timer);
  },[query]);

  const loadAll=async()=>{
    weatherController.current?.abort(); airController.current?.abort();
    const wa=new AbortController(), aa=new AbortController();
    weatherController.current=wa; airController.current=aa;
    setWeatherLoading(true);setAirLoading(true);setWeatherError("");setAirError("");
    const [wr,ar]=await Promise.allSettled([fetchWeather(selectedLocation,wa.signal),fetchAirQuality(selectedLocation,aa.signal)]);
    if(wr.status==="fulfilled"){const data=wr.value;setWeather({...data,presentation:getWeatherPresentation(data)});setLastUpdated(new Date());}
    else if(wr.reason?.name!=="AbortError"){setWeatherError(wr.reason?.message||"Could not load live weather.");}
    if(ar.status==="fulfilled")setAirQuality(ar.value);
    else if(ar.reason?.name!=="AbortError")setAirError(ar.reason?.message||"Could not load air quality.");
    setWeatherLoading(false);setAirLoading(false);
  };

  useEffect(()=>{let ignore=false; const run=async()=>{if(!ignore)await loadAll()};run();return()=>{ignore=true;weatherController.current?.abort();airController.current?.abort();};},[selectedLocation]);
  useEffect(()=>{if(!autoRefresh)return;const t=setInterval(loadAll,10*60*1000);return()=>clearInterval(t);},[autoRefresh,selectedLocation]);
  useEffect(()=>{saveLocations(saved);},[saved]);
  useEffect(()=>{
    let ignore=false;
    detectCurrentLocation()
      .then((location) => {
        if (!ignore && location) {
          setSelectedLocation(location);
          setQuery("");
          setLocationError("");
        }
      })
      .catch(() => {
        if (!ignore) setLocationError("Live location detection is unavailable. Showing default national view.");
      });
    return () => { ignore = true; };
  }, []);

  const navigate=(label)=>{
    setActive(label);
    const map={Home:"top",Search:"top",Forecast:"forecast",Moon:"moon", "Air Quality":"air","Saved Locations":"saved"};
    if(map[label]) document.getElementById(map[label])?.scrollIntoView({behavior:"smooth",block:"start"});
    if(label==="Search") window.dispatchEvent(new Event("atmos:focus-search"));
    if(label==="Map") setModal(null);
    if(label==="Alerts") setModal(null);
    if(label==="Settings") setModal("settings");
  };

  const selectLocation=(location)=>{
    if(!location) return;
    let finalLoc = location;
    
    // If location lacks coordinates, try to provide defaults for common Indian cities
    if((finalLoc.latitude==null || finalLoc.longitude==null) && finalLoc.name){
      const cityCoords = {
        "India": {latitude: 22.5937, longitude: 78.9629},
        "Dehradun": {latitude: 30.1975, longitude: 78.0081},
        "Mumbai": {latitude: 19.0760, longitude: 72.8777},
        "Delhi": {latitude: 28.6139, longitude: 77.2090},
        "Bangalore": {latitude: 12.9716, longitude: 77.5946},
        "Hyderabad": {latitude: 17.3850, longitude: 78.4867},
        "Kolkata": {latitude: 22.5726, longitude: 88.3639},
        "Chennai": {latitude: 13.0827, longitude: 80.2707},
        "Pune": {latitude: 18.5204, longitude: 73.8567},
        "Ahmedabad": {latitude: 23.0225, longitude: 72.5714}
      };
      // Try exact match first, then try extracting city name from "City, Country" format
      let coords = cityCoords[finalLoc.name];
      if(!coords && finalLoc.name.includes(",")){
        const cityName = finalLoc.name.split(",")[0].trim();
        coords = cityCoords[cityName];
      }
      if(coords){finalLoc = {...location, latitude: coords.latitude, longitude: coords.longitude};}
    }
    
    if(finalLoc.latitude!=null&&finalLoc.longitude!=null){
      setSelectedLocation(finalLoc);setQuery(formatLocation(finalLoc));setSearchResults([]);setLocationError("");navigate("Home");setToast(`Weather for ${formatLocation(finalLoc)} updated.`);
    }else{
      setLocationError("This location is missing coordinates. Please search again.");
    }
  };
  const useCurrentLocation=async()=>{
    setLocating(true);setLocationError("");
    try{selectLocation(await detectCurrentLocation());setToast("Current location updated.");}
    catch(error){setLocationError(error?.code===1?"Location permission was denied. Allow location access and try again.":error?.code===3?"Location detection timed out. Please try again.":error.message||"Could not detect your location.");}
    finally{setLocating(false);}
  };
  const toggleSaved=()=>{
    const key=locationKey(selectedLocation);
    if(saved.some(item=>locationKey(item)===key)){setSaved(saved.filter(item=>locationKey(item)!==key));setToast("Removed from saved locations.");}
    else{const locToSave={...selectedLocation,id:selectedLocation.id||`saved-${Date.now()}`,temperature:weather?.presentation?.temperature};if(locToSave.latitude!=null&&locToSave.longitude!=null){setSaved([...saved,locToSave]);setToast("Location saved.");}else{setToast("Cannot save - missing coordinates.");}}
  };
  const removeSaved=(id)=>{setSaved(saved.filter(item=>item.id!==id));setToast("Saved location removed.");};
  const isSaved=saved.some(item=>locationKey(item)===locationKey(selectedLocation));
  const locationLabel=useMemo(()=>formatLocation(selectedLocation),[selectedLocation]);

  const alerts=useMemo(()=>{
    if(!weather)return [];
    const c=weather.current, list=[];
    if(c.weather_code>=95)list.push({title:"Thunderstorm conditions",text:"Lightning and heavy weather may develop. Stay alert outdoors."});
    else if(c.weather_code>=80)list.push({title:"Rain expected",text:"Carry rain protection and allow extra travel time."});
    if(c.precipitation>5)list.push({title:"High precipitation",text:`${c.precipitation.toFixed(1)} mm recorded in the current period.`});
    if(c.uv_index>=8)list.push({title:"Very high UV",text:"Limit prolonged midday sun exposure."});
    if(!list.length)list.push({title:"No active weather alerts",text:"Conditions look calm for the selected location."});
    return list;
  },[weather]);

  const indiaBounds = {
    west: 68.1862,
    south: 6.7535,
    east: 97.4024,
    north: 35.5045
  };

  const weatherHighlights = [
    { label: "Current", value: weather?.presentation ? `${formatTemperature(weather.presentation.temperature, unit)}` : "--" },
    { label: "Feels Like", value: weather?.presentation ? `${formatTemperature(weather.presentation.feelsLike, unit)}` : "--" },
    { label: "Humidity", value: weather?.presentation ? `${weather.presentation.humidity}%` : "--" },
    { label: "Wind", value: weather?.presentation ? `${weather.presentation.windSpeed} km/h` : "--" }
  ];

  const renderFeaturePage = () => {
    if (active === "Search") {
      return <section className="feature-page" id="search-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Search</span>
            <h1>Find your weather location</h1>
          </div>
          <button className="primary-modal-button" onClick={() => window.dispatchEvent(new Event("atmos:focus-search"))}>Open search</button>
        </div>
        <div className="feature-grid two-up">
          <div className="feature-card">
            <h3>Popular search results</h3>
            <div className="mini-list">
              {searchResults.length ? searchResults.map((result) => (
                <button key={`${result.id}-${result.latitude}`} className="list-row" onClick={() => selectLocation(result)}>
                  <span>{result.name}</span>
                  <small>{[result.admin1, result.country].filter(Boolean).join(", ")}</small>
                </button>
              )) : (
                <div className="empty-state">Search for a city, region, or country to see results here.</div>
              )}
            </div>
          </div>
          <div className="feature-card">
            <h3>Quick actions</h3>
            <div className="stat-grid">
              {weatherHighlights.map((stat) => (
                <div className="mini-stat" key={stat.label}>
                  <small>{stat.label}</small>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
            <button className="primary-modal-button full-width" onClick={useCurrentLocation}>{locating ? "Locating..." : "Use my current location"}</button>
          </div>
        </div>
      </section>;
    }

    if (active === "Map") {
      return <section className="feature-page" id="map-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Map</span>
            <h1>India weather map</h1>
          </div>
          <button className="primary-modal-button" onClick={() => setModal("map")}>Open map view</button>
        </div>
        <div className="feature-grid map-layout">
          <div className="feature-card map-panel">
            <iframe title="India weather map" src={`https://www.openstreetmap.org/export/embed.html?bbox=${indiaBounds.west}%2C${indiaBounds.south}%2C${indiaBounds.east}%2C${indiaBounds.north}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`}></iframe>
          </div>
          <div className="feature-card">
            <h3>Forecast points</h3>
            <div className="mini-list">
              {saved.length ? saved.slice(0, 6).map((place) => (
                <button key={place.id} className="list-row" onClick={() => selectLocation(place)}>
                  <span>{place.name}</span>
                  <small>{formatLocation(place)}</small>
                </button>
              )) : (
                <div className="empty-state">No saved places yet. Save your active location to build a real travel map.</div>
              )}
            </div>
          </div>
        </div>
      </section>;
    }

    if (active === "Forecast") {
      return <section className="feature-page" id="forecast-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Forecast</span>
            <h1>Daily weather outlook</h1>
          </div>
          <div className="forecast-toggle compact-toggle">
            <button className={days === 5 ? "active" : ""} onClick={() => setDays(5)}>5 Days</button>
            <button className={days === 10 ? "active" : ""} onClick={() => setDays(10)}>10 Days</button>
          </div>
        </div>
        <div className="feature-card">
          <DailyForecast days={days} onDaysChange={setDays} weather={weather} unit={unit} />
        </div>
      </section>;
    }

    if (active === "Moon") {
      return <section className="feature-page" id="moon-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Moon</span>
            <h1>Lunar condition</h1>
          </div>
        </div>
        <div className="feature-card moon-detail-panel">
          <MoonCard location={selectedLocation} />
        </div>
      </section>;
    }

    if (active === "Air Quality") {
      return <section className="feature-page" id="air-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Air Quality</span>
            <h1>Air quality overview</h1>
          </div>
        </div>
        <div className="feature-card">
          <AirQualityCard airQuality={airQuality} loading={airLoading} error={airError} />
        </div>
      </section>;
    }

    if (active === "Saved Locations") {
      return <section className="feature-page" id="saved-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Saved</span>
            <h1>Saved weather locations</h1>
          </div>
          <button className="primary-modal-button" onClick={toggleSaved}>Save current</button>
        </div>
        <div className="feature-card">
          <SavedLocations locations={saved} currentId={selectedLocation.id} onSelect={selectLocation} onAdd={toggleSaved} onRemove={removeSaved}/>
        </div>
      </section>;
    }

    if (active === "Alerts") {
      return <section className="feature-page" id="alerts-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Alerts</span>
            <h1>Weather alerts</h1>
          </div>
        </div>
        <div className="feature-card alert-stack">
          {alerts.map((a,i)=> <div className="alert-item" key={i}><div className="alert-icon"><Bell size={16}/></div><div><strong>{a.title}</strong><p>{a.text}</p></div></div>)}
        </div>
      </section>;
    }

    if (active === "Settings") {
      return <section className="feature-page" id="settings-page">
        <div className="feature-header">
          <div>
            <span className="feature-kicker">Settings</span>
            <h1>App preferences</h1>
          </div>
        </div>
        <div className="feature-card">
          <div className="settings-content">
            <label className="setting-row"><span><strong>Temperature unit</strong><small>Choose how temperatures are displayed.</small></span><div className="setting-segment"><button className={unit==="C"?"active":""} onClick={()=>setUnit("C")}>°C</button><button className={unit==="F"?"active":""} onClick={()=>setUnit("F")}>°F</button></div></label>
            <label className="setting-row"><span><strong>Automatic refresh</strong><small>Refresh live data every 10 minutes.</small></span><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/></label>
            <label className="setting-row"><span><strong>Motion</strong><small>Animations respect your browser's reduced-motion preference.</small></span><span className="setting-status">Smooth</span></label>
            <button className="primary-modal-button" onClick={()=>{setModal(null); setToast("Settings saved.");}}>Save settings</button>
          </div>
        </div>
      </section>;
    }

    return null;
  };

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={navigate} unit={unit}/>
    <main className="main-content" id="top">
      <Topbar query={query} onQueryChange={v=>{setQuery(v);setLocationError("");}} results={searchResults} onSelect={selectLocation} onUseCurrentLocation={useCurrentLocation} locating={locating} locationError={locationError}
        actions={<>
          <button
            className="icon-button"
            onClick={()=>setThemeMode((prev)=> prev === "auto" ? "dark" : "auto")}
            title={themeMode === "auto" ? (resolvedTheme === "dark" ? "Switch to day mode" : "Switch to night mode") : "Reset to live day/night mode"}
          >
            {resolvedTheme === "dark" ? <MoonIcon size={19}/> : <Sun size={19}/>}
          </button>
          <button className="icon-button" onClick={()=>setModal("settings")} title="Settings"><Settings size={19}/></button>
        </>}
      />

      <div className="active-location-bar">
        <span className="location-dot"></span><span>Live weather for</span><strong>{locationLabel}</strong>
        {selectedLocation.latitude != null && selectedLocation.longitude != null && <span className="coordinates">{Number(selectedLocation.latitude).toFixed(4)}, {Number(selectedLocation.longitude).toFixed(4)}</span>}
        {lastUpdated&&<span className="updated-time">Updated {lastUpdated.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</span>}
        <button className={`save-current ${isSaved?"saved":""}`} onClick={toggleSaved}>{isSaved?"Saved":"Save location"}</button>
        <button className="mini-refresh" onClick={()=>{loadAll();setToast("Refreshing live weather...");}} title="Refresh weather"><RefreshCw size={13}/></button>
      </div>

      {weatherError&&<div className="global-weather-error"><strong>Live weather unavailable.</strong> {weatherError}</div>}

      {active !== "Home" ? renderFeaturePage() : <div className="dashboard-grid">
        <div className="primary-column">
          <section id="weather-panel"><CurrentWeather location={selectedLocation} weather={weather} loading={weatherLoading} error={weatherError} unit={unit}/></section>
          <section id="hourly"><HourlyForecast weather={weather} unit={unit} onRefresh={()=>{loadAll();setToast("Hourly forecast refreshed.");}}/></section>
          <section id="forecast"><DailyForecast days={days} onDaysChange={setDays} weather={weather} unit={unit}/></section>
          <WeatherDetailCards weather={weather}/>
        </div>
        <aside className="secondary-column">
          <DailyForecast compact weather={weather} unit={unit}/>
          <section id="moon"><MoonCard location={selectedLocation}/></section>
          <section id="air"><AirQualityCard airQuality={airQuality} loading={airLoading} error={airError}/></section>
          <section id="saved"><SavedLocations locations={saved} currentId={selectedLocation.id} onSelect={selectLocation} onAdd={toggleSaved} onRemove={removeSaved}/></section>
        </aside>
      </div>}

      <footer className="data-attribution">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>. Air-quality data by <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Open-Meteo</a>.</footer>
    </main>

    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(null)}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-head"><div><span className="modal-kicker">ATMOS</span><h2>{modal==="settings"?"Settings":modal==="map"?"Location Map":"Weather Alerts"}</h2></div><button className="modal-close" onClick={()=>setModal(null)}><X size={18}/></button></div>

        {modal==="settings"&&<div className="settings-content">
          <label className="setting-row"><span><strong>Temperature unit</strong><small>Choose how temperatures are displayed.</small></span><div className="setting-segment"><button className={unit==="C"?"active":""} onClick={()=>setUnit("C")}>°C</button><button className={unit==="F"?"active":""} onClick={()=>setUnit("F")}>°F</button></div></label>
          <label className="setting-row"><span><strong>Automatic refresh</strong><small>Refresh live data every 10 minutes.</small></span><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/></label>
          <label className="setting-row"><span><strong>Motion</strong><small>Animations respect your browser's reduced-motion preference.</small></span><span className="setting-status">Smooth</span></label>
          <button className="primary-modal-button" onClick={()=>{setModal(null);setToast("Settings saved.");}}>Done</button>
        </div>}

        {modal==="map"&&<div className="map-content">
          <div className="map-location"><MapPinned size={18}/><div><strong>{locationLabel}</strong><span>{selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}</span></div></div>
          <iframe title="OpenStreetMap location" src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude-0.05}%2C${selectedLocation.latitude-0.04}%2C${selectedLocation.longitude+0.05}%2C${selectedLocation.latitude+0.04}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`}></iframe>
        </div>}

        {modal==="alerts"&&<div className="alerts-content">{alerts.map((a,i)=><div className="alert-item" key={i}><div className="alert-icon"><Bell size={16}/></div><div><strong>{a.title}</strong><p>{a.text}</p></div></div>)}<button className="primary-modal-button" onClick={()=>{setModal(null);setToast("Alerts checked.");}}><CheckCircle2 size={16}/> Done</button></div>}
      </div>
    </div>}

    {toast&&<div className="toast"><CheckCircle2 size={16}/>{toast}</div>}
  </div>;
}
