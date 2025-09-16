import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Point = { id: string; name: string; lat: number; lon: number };
type Props = { points?: Point[] };

// The published styles from MapTiler Customize (already include ?key=…)
const STYLE_LIGHT =
  "https://api.maptiler.com/maps/019951a8-6432-7aea-b555-2ac65a59181f/style.json?key=Dh5hFFvt6R7cmui0rEtJ";
const STYLE_DARK =
  "https://api.maptiler.com/maps/019951b2-24e8-7a45-8534-0731061b7984/style.json?key=Dh5hFFvt6R7cmui0rEtJ";

function isDark() {
  return document.documentElement.classList.contains("dark");
}
function getAccent() {
  // reads Tailwind token set in :root / .dark
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  // token is "r g b" (from the setup), normalize to rgb()
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

    const map = new maplibregl.Map({
      container: ref.current,
      style: styleForTheme(),
      center: [15, 62], // Sweden-ish
      zoom: 4.3,
      minZoom: 3,
      maxZoom: 14,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.once("load", () => {
      // ensure it fills after layout settles
      setTimeout(() => map.resize(), 0);
    });

    // helper to (re)draw markers
    const drawMarkers = () => {
      const accent = getAccent();
      // clear old
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      points.forEach((p) => {
        const el = document.createElement("div");
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "9999px";
        el.style.background = accent;
        el.style.boxShadow = isDark()
          ? "0 0 0 2px rgba(0,0,0,0.6)"
          : "0 0 0 2px rgba(255,255,255,0.85)";

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.lon, p.lat])
          .setPopup(
            new maplibregl.Popup({ closeButton: false }).setText(p.name)
          )
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit view if there are several points
      if (points.length >= 2) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lon, p.lat]));
        map.fitBounds(b, { padding: 24, maxZoom: 8 });
      }
    };

    drawMarkers();

    // Swap style when the page toggles dark mode
    const obs = new MutationObserver(() => {
      const url = styleForTheme();
      map.setStyle(url);
      map.once("styledata", drawMarkers);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

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
