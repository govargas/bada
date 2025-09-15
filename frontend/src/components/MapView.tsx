import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Point = { id: string; name: string; lat: number; lon: number };
type Props = { points?: Point[] };

function isDark() {
  return document.documentElement.classList.contains("dark");
}
function getAccent() {
  // reads your Tailwind token set in :root / .dark
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  // token is "r g b" (from your setup), normalize to rgb()
  return v.includes(" ") ? `rgb(${v})` : v || "#0a5a82";
}
function styleForTheme(key?: string) {
  const light = `https://api.maptiler.com/maps/dataviz/style.json?key=${key}`;
  const dark = `https://api.maptiler.com/maps/darkmatter/style.json?key=${key}`;
  return isDark() ? dark : light;
}

export default function MapView({ points = [] }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!ref.current) return;

    const key = import.meta.env.VITE_MAPTILER_KEY as string | undefined;
    const map = new maplibregl.Map({
      container: ref.current,
      style: styleForTheme(key),
      center: [15, 62], // Sweden-ish
      zoom: 4.3,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.once("load", () => {
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

      // Fit view if we have several points
      if (points.length >= 2) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lon, p.lat]));
        map.fitBounds(b, { padding: 24, maxZoom: 8 });
      }
    };

    drawMarkers();

    // observe <html class="dark"> changes and swap style
    const obs = new MutationObserver(() => {
      const url = styleForTheme(key);
      map.setStyle(url);
      // when style is ready, redraw markers (they survive setStyle, but
      // we redraw to refresh marker ring color if accent/border changed)
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
        className="w-full aspect-square min-h-[180px] rounded-2xl"
        style={{ overflow: "hidden" }}
      />
    </div>
  );
}
