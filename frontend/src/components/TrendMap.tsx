import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Dataset, VarKey } from "../types";
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

interface Props {
  data: Dataset;
  variable: VarKey;
  selected: string | null;
  onSelect: (name: string) => void;
}

export default function TrendMap({ data, variable, selected, onSelect }: Props) {
  const entries = Object.entries(data.places);
  const points = entries.map(([, p]) => [p.lat, p.lon] as [number, number]);
  return (
    <MapContainer center={[26.8, 74.8]} zoom={6} className="h-[520px] w-full rounded-xl">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
        maxZoom={12}
      />
      <FitBounds points={points} />
      {entries.map(([name, p]) => (
        <CircleMarker
          key={name}
          center={[p.lat, p.lon]}
          radius={name === selected ? 16 : 13}
          pathOptions={{
            color: name === selected ? "#facc15" : "#ffffff",
            weight: name === selected ? 3 : 2,
            fillColor: colorFor(p[variable].trend, variable),
            fillOpacity: 0.9,
          }}
          eventHandlers={{ click: () => onSelect(name) }}
        >
          <Tooltip>{`${name}: ${p[variable].trend}`}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
