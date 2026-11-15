import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import type { Dataset, Place, VarKey } from "../types";
import { colorFor } from "../utils";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(points, { padding: [40, 40] });
    // fit once when the map first appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function ResetViewButton({ points }: { points: [number, number][] }) {
  const map = useMap();
  return (
    <button
      type="button"
      className="map-reset-button"
      onClick={() => points.length && map.fitBounds(points, { padding: [40, 40] })}
      aria-label="Reset map view to show all places"
    >
      Reset map view
    </button>
  );
}

function AccessibleMarker({
  name,
  place,
  variable,
  selected,
  onSelect,
}: {
  name: string;
  place: Place;
  variable: VarKey;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const markerRef = useRef<LeafletCircleMarker | null>(null);

  useEffect(() => {
    const element = markerRef.current?.getElement();
    if (!element) return;
    element.setAttribute("tabindex", "0");
    element.setAttribute("role", "button");
    element.setAttribute("aria-label", `${name}: ${place[variable].trend}. Press Enter to view details.`);
    element.setAttribute("aria-pressed", String(selected));
    const onKeyDown = (event: Event) => {
      const key = (event as KeyboardEvent).key;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        onSelect(name);
      }
    };
    element.addEventListener("keydown", onKeyDown);
    return () => element.removeEventListener("keydown", onKeyDown);
  }, [name, onSelect, place, selected, variable]);

  return (
    <CircleMarker
      ref={markerRef}
      center={[place.lat, place.lon]}
      radius={selected ? 16 : 13}
      pathOptions={{
        color: selected ? "#facc15" : "#ffffff",
        weight: selected ? 3 : 2,
        fillColor: colorFor(place[variable].trend, variable),
        fillOpacity: 0.9,
      }}
      eventHandlers={{ click: () => onSelect(name) }}
    >
      <Tooltip>{`${name}: ${place[variable].trend}, p = ${place[variable].p}`}</Tooltip>
    </CircleMarker>
  );
}

interface Props {
  data: Dataset;
  variable: VarKey;
  selected: string | null;
  onSelect: (name: string) => void;
  theme: "light" | "dark";
}

export default function TrendMap({ data, variable, selected, onSelect, theme }: Props) {
  const entries = Object.entries(data.places);
  const points = entries.map(([, p]) => [p.lat, p.lon] as [number, number]);
  return (
    <div className={`map-card ${theme === "dark" ? "map-theme-dark" : ""}`} role="region" aria-label="Interactive climate trend map">
    <MapContainer center={[26.8, 74.8]} zoom={6} className="map-frame">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
        maxZoom={12}
      />
      <FitBounds points={points} />
      <ResetViewButton points={points} />
      {entries.map(([name, p]) => (
        <AccessibleMarker
          key={name}
          name={name}
          place={p}
          variable={variable}
          selected={name === selected}
          onSelect={onSelect}
        />
      ))}
    </MapContainer>
    <MapLegend variable={variable} />
    </div>
  );
}

function MapLegend({ variable }: { variable: VarKey }) {
  const increasing = colorFor("increasing", variable);
  return (
    <aside className="map-legend" aria-label={`${variable === "temp" ? "Temperature" : "Rainfall"} map legend`}>
      <p className="map-legend-title">Map legend</p>
      <p className="map-legend-subtitle">Click a marker for details</p>
      <div className="map-legend-item"><i style={{ background: increasing }} /> Increasing</div>
      <div className="map-legend-item"><i style={{ background: colorFor("decreasing", variable) }} /> Decreasing</div>
      <div className="map-legend-item"><i style={{ background: colorFor("no significant trend", variable) }} /> No significant trend</div>
    </aside>
  );
}
