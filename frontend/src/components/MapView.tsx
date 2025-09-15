// frontend/src/components/MapView.tsx
import { useEffect, useRef } from "react";
import maplibregl, { Map, LngLatLike } from "maplibre-gl";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function MapView() {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: elRef.current,
      style: `https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`,
      center: [18.06, 59.33] as LngLatLike, // Stockholm-ish
      zoom: 4.5,
      minZoom: 2,
      cooperativeGestures: true,
      attributionControl: { compact: true }, // ✅ type-safe
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  return (
    <div
      ref={elRef}
      className="h-64 w-full rounded-2xl border border-border overflow-hidden"
    />
  );
}
