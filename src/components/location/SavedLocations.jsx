import { MapPin, Plus, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import { formatLocation } from "../../services/location";

export default function SavedLocations({ locations, currentId, onSelect, onAdd, onRemove }) {
  return (
    <Card
      title="Saved Locations"
      action={<button className="add-location" onClick={onAdd} aria-label="Save current location"><Plus size={16} /></button>}
    >
      <div className="saved-locations">
        {locations.length === 0 && <div className="empty-saved">No saved locations yet.</div>}
        {locations.map((location) => (
          <div className={`saved-location ${currentId === location.id ? "active" : ""}`} key={location.id}>
            <button className="saved-main" onClick={() => onSelect(location)}>
              <MapPin size={16} />
              <span>
                <strong>{location.name}</strong>
                <small>{formatLocation(location)}</small>
              </span>
              {location.temperature != null && <b>{location.temperature}°</b>}
            </button>
            <button className="remove-saved" onClick={() => onRemove(location.id)} aria-label={`Remove ${location.name}`}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
