// frontend/src/components/MapView.tsx
import { useEffect, useRef } from "react";
import maplibregl, { Map, LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Point = { id: string; name: string; lat: number; lon: number };
type Props = {
  points?: Point[];
  /** If provided, the map fits to this center (+ optional radiusKm) */
  focus?: { center: { lon: number; lat: number }; radiusKm?: number };
  /** Notifies parent when user stops moving the map (for viewport-based filtering) */
  onMoveEnd?: (args: {
    bounds: { west: number; south: number; east: number; north: number };
    center: { lon: number; lat: number };
    zoom: number;
  }) => void;
};

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

// compute bounds from center + radius (km)
function circleBounds(
  center: { lon: number; lat: number },
  radiusKm: number
): LngLatBoundsLike {
  const lat = center.lat;
  const dLat = radiusKm / 111; // ~111km per deg
  const dLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const west = center.lon - dLon;
  const east = center.lon + dLon;
  const south = center.lat - dLat;
  const north = center.lat + dLat;
  return [
    [west, south],
    [east, north],
  ];
}

export default function MapView({ points = [], focus, onMoveEnd }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // init + theme swap + markers
  useEffect(() => {
    if (!ref.current) return;

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

    // --- drawMarkers (unchanged) ---
    const drawMarkers = () => {
      const accent = getAccent();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      points.forEach((p) => {
        const el = document.createElement("div");
        el.className =
          "w-3 h-3 rounded-full shadow " +
          (document.documentElement.classList.contains("dark")
            ? "ring-2 ring-black/60"
            : "ring-2 ring-white/85");
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

    // Swap style when dark mode toggles
    const obs = new MutationObserver(() => {
      const url = styleForTheme();
      map.setStyle(url);
      map.once("styledata", drawMarkers);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // ✅ Only fire onMoveEnd when the user actually interacted
    let userMoving = false;
    map.on("movestart", (e) => {
      // e.originalEvent exists only for user-initiated interactions
      userMoving = !!(e as any).originalEvent;
    });
    map.on("moveend", () => {
      if (!userMoving) return;
      userMoving = false;
      if (!onMoveEnd) return;
      const b = map.getBounds();
      const c = map.getCenter();
      onMoveEnd({
        bounds: {
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        },
        center: { lon: c.lng, lat: c.lat },
        zoom: map.getZoom(),
      });
    });

    return () => {
      obs.disconnect();
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [points, onMoveEnd]);

  // respond to points change (redraw markers + maybe fit)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // redraw markers
    const accent = getAccent();
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    points.forEach((p) => {
      const el = document.createElement("div");
      el.className =
        "w-3 h-3 rounded-full shadow " +
        (isDark() ? "ring-2 ring-black/60" : "ring-2 ring-white/85");
      el.style.background = accent;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lon, p.lat])
        .setPopup(new maplibregl.Popup({ closeButton: false }).setText(p.name))
        .addTo(map);
      markersRef.current.push(marker);
    });

    // If points are many, keep view; if 1, zoom closer
    if (points.length === 1) {
      const p = points[0];
      map.flyTo({ center: [p.lon, p.lat], zoom: 12 });
    }
  }, [points]);

  // respond to focus changes (fit to radius/center)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus?.center) return;

    if (focus.radiusKm && focus.radiusKm > 0) {
      const b = circleBounds(focus.center, focus.radiusKm);
      map.fitBounds(b, { padding: 24, maxZoom: 12 });
    } else {
      map.flyTo({ center: [focus.center.lon, focus.center.lat], zoom: 11 });
    }
  }, [focus]);

  return (
    <div className="card p-0">
      <div ref={ref} className="w-full h-[260px] rounded-2xl overflow-hidden" />
    </div>
  );
}
