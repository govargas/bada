// frontend/src/components/MapView.tsx
import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Point = { id: string; name: string; lat: number; lon: number };
type Props = { points?: Point[] };

const STYLE_LIGHT =
  "https://api.maptiler.com/maps/019951a8-6432-7aea-b555-2ac65a59181f/style.json?key=Dh5hFFvt6R7cmui0rEtJ";
const STYLE_DARK =
  "https://api.maptiler.com/maps/019951b2-24e8-7a45-8534-0731061b7984/style.json?key=Dh5hFFvt6R7cmui0rEtJ";

function isDark() {
  return document.documentElement.classList.contains("dark");
}
function getAccent() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  return v.includes(" ") ? `rgb(${v})` : v || "#0a5a82";
}
function styleForTheme() {
  return isDark() ? STYLE_DARK : STYLE_LIGHT;
}

export default function MapView({ points = [] }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!ref.current) return;

    // Initialize map
    const map = new maplibregl.Map({
      container: ref.current,
      style: styleForTheme(),
      center: [15, 62],
      zoom: 4.3,
      minZoom: 3,
      maxZoom: 14,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.once("load", () => setTimeout(() => map.resize(), 0));

    // Draw markers function
    const drawMarkers = () => {
      const accent = getAccent();

      // clear old
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      points.forEach((p) => {
        const el = document.createElement("div");
        // class for size + border; inline background so it follows the accent token dynamically
        el.className =
          "w-3 h-3 rounded-full shadow " +
          (isDark() ? "ring-2 ring-black/60" : "ring-2 ring-white/85");
        el.style.background = accent;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.lon, p.lat])
          .setPopup(
            new maplibregl.Popup({ closeButton: false }).setText(p.name)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });

      if (points.length >= 2) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lon, p.lat]));
        map.fitBounds(b, { padding: 24, maxZoom: 8 });
      }
    };

    drawMarkers();

    // redraw markers when points change
    const obs = new MutationObserver(() => {
      const url = styleForTheme();
      map.setStyle(url);
      map.once("styledata", drawMarkers);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // cleanup
    return () => {
      obs.disconnect();
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  return (
    <div className="card p-0">
      <div
        ref={ref}
        className="w-full h-[260px] rounded-2xl"
        style={{ overflow: "hidden" }}
      />
    </div>
  );
}
