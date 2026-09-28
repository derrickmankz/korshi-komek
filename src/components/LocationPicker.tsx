import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pickerIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#d97706;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.45);cursor:grab"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  center?: [number, number];
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(
        Math.round(e.latlng.lat * 100000) / 100000,
        Math.round(e.latlng.lng * 100000) / 100000,
      );
    },
  });
  return null;
}

function CenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevRef = useRef<[number, number] | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (!prev || prev[0] !== center[0] || prev[1] !== center[1]) {
      map.setView(center, 14, { animate: true });
      prevRef.current = center;
    }
  }, [center, map]);
  return null;
}

export function LocationPicker({ lat, lng, onChange, center }: Props) {
  const effectiveCenter: [number, number] = center ?? [lat, lng];

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: 260 }}>
      <MapContainer
        center={effectiveCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <CenterController center={effectiveCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <Marker
          position={[lat, lng]}
          icon={pickerIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const pos = (e.target as L.Marker).getLatLng();
              onChange(
                Math.round(pos.lat * 100000) / 100000,
                Math.round(pos.lng * 100000) / 100000,
              );
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
