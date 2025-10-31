// frontend/src/components/MapView.tsx
import { useEffect, useRef } from "react";
import maplibregl, { Map, LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Point = { id: string; name: string; lat: number; lon: number };
type Props = {
  points?: Point[];
  /** If provided, the map fits to this center (+ optional radiusKm) */
  focus?: { center: { lon: number; lat: number }; radiusKm?: number };
  /** Fires only on *user*-initiated pan/zoom (not programmatic fits) */
  onMoveEnd?: (args: {
    bounds: { west: number; south: number; east: number; north: number };
    center: { lon: number; lat: number };
    zoom: number;
  }) => void;
  /** Fires after programmatic fits */
  onFitBounds?: (args: {
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
  const dLat = radiusKm / 111; // ~111 km per deg
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

export default function MapView({ points = [], focus, onMoveEnd, onFitBounds }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onMoveEndRef = useRef(onMoveEnd);
  onMoveEndRef.current = onMoveEnd; // keep latest callback without re-binding listeners
  const onFitBoundsRef = useRef(onFitBounds);
  onFitBoundsRef.current = onFitBounds;

  // Init map ONCE
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

    // Dark/light swap only when theme class changes
    const obs = new MutationObserver(() => {
      const url = styleForTheme();
      map.setStyle(url);
      // Markers survive style swaps; if your style clears layers we can redraw, but
      // here we just wait for style to settle so tiles don’t appear blank.
      map.once("styledata", () => {
        // no-op; we keep existing markers (no flicker)
      });
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Only count *user* moves
    let userMoving = false;
    map.on("movestart", (e) => {
      userMoving = !!(e as any).originalEvent; // programmatic fits won't set this
    });
    map.on("moveend", () => {
      const b = map.getBounds();
      const c = map.getCenter();
      const boundsObj = {
        bounds: {
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        },
        center: { lon: c.lng, lat: c.lat },
        zoom: map.getZoom(),
      };
      
      if (userMoving) {
        // User-initiated move
        userMoving = false;
        if (onMoveEndRef.current) {
          onMoveEndRef.current(boundsObj);
        }
      } else if (onFitBoundsRef.current) {
        // Programmatic fit
        onFitBoundsRef.current(boundsObj);
      }
    });

    return () => {
      obs.disconnect();
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []); // ← no dependencies (don’t recreate the map)

  // Update markers when points change (NO map re-init, NO auto-fit here)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const accent = getAccent();
    // clear old
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
  }, [points]);

  // Fit to focus (center + radius) without flashing; allow closer zoom for small radii
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus?.center) return;

    map.stop(); // cancel any ongoing camera animation

    if (focus.radiusKm && focus.radiusKm > 0) {
      const r = focus.radiusKm;

      // 🔧 TIGHTEN the fit for small radii
      // - Shrink the radius a bit so bounds aren’t too wide
      // - Reduce padding so more of the view is the actual area of interest
      // - Let the map zoom in a bit more
      const isSmall = r <= 5; // the 5 km “nearby” case
      const effective = isSmall ? r * 0.65 : r; // <— tighten bounds
      const padding = isSmall ? 12 : 24; // less padding on small areas
      const maxZoom = isSmall ? 16 : 12; // allow closer zoom on small areas

      const b = circleBounds(focus.center, effective);
      map.fitBounds(b, { padding, maxZoom });
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
