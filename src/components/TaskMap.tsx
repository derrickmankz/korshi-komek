import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Task } from "@workspace/api-client-react";
import { categoryLabels, formatTenge } from "@/lib/labels";

const CATEGORY_COLOR: Record<string, string> = {
  walk_dog: "#f97316",
  groceries: "#22c55e",
  parcel_pickup: "#3b82f6",
  plant_care: "#84cc16",
  pet_sitting: "#f59e0b",
  errand: "#8b5cf6",
  cleaning_help: "#06b6d4",
  other: "#6b7280",
};

function makeIcon(category: string) {
  const color = CATEGORY_COLOR[category] ?? "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -14],
  });
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface TaskMapProps {
  tasks: Task[];
  center: [number, number];
  radiusKm?: number;
}

export function TaskMap({ tasks, center, radiusKm = 0 }: TaskMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: 520 }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radiusKm > 0 && (
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#d97706", fillColor: "#d97706", fillOpacity: 0.06, weight: 1.5, dashArray: "6 4" }}
          />
        )}
        {tasks.map((t) => (
          <Marker
            key={t.id}
            position={[t.latitude, t.longitude]}
            icon={makeIcon(t.category)}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "inherit" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                  {categoryLabels[t.category]} · {formatTenge(t.priceTenge)}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
                  {t.address}
                </div>
                <a
                  href={`${BASE}/tasks/${t.id}`}
                  style={{ fontSize: 12, color: "#d97706", fontWeight: 600, textDecoration: "none" }}
                >
                  Открыть задание →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
