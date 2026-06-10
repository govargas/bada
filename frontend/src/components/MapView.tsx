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

// The MapTiler key is a publishable client-side key — keep it in env (not in
// source) and restrict it by allowed origin in the MapTiler dashboard. The
// style IDs themselves are not secret.
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
if (!MAPTILER_KEY) {
  console.warn(
    "VITE_MAPTILER_KEY is not set — the map will fail to load. See frontend/.env.example."
  );
}
const STYLE_LIGHT_ID = "019951a8-6432-7aea-b555-2ac65a59181f";
const STYLE_DARK_ID = "019951b2-24e8-7a45-8534-0731061b7984";
const STYLE_LIGHT = `https://api.maptiler.com/maps/${STYLE_LIGHT_ID}/style.json?key=${MAPTILER_KEY}`;
const STYLE_DARK = `https://api.maptiler.com/maps/${STYLE_DARK_ID}/style.json?key=${MAPTILER_KEY}`;

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
function getPopupStyles() {
  const dark = isDark();
  return {
    background: dark ? "#1f2937" : "#ffffff", // gray-800 : white
    color: dark ? "#f9fafb" : "#111827", // gray-50 : gray-900
    borderColor: dark ? "#374151" : "#e5e7eb", // gray-700 : gray-200
  };
}

function toGeoJSON(
  points: Point[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      properties: { id: p.id, name: p.name },
    })),
  };
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

export default function MapView({
  points = [],
  focus,
  onMoveEnd,
  onFitBounds,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const pointsRef = useRef<Point[]>(points);
  pointsRef.current = points; // keep latest data for (re)builds without re-binding
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
      maxZoom: 18, // Increased to allow more detailed zoom
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    // Add the beaches source + layers. Idempotent so it can run on first load
    // and again after a style swap (setStyle wipes custom sources/layers).
    function addBeachLayers() {
      if (!map.isStyleLoaded() || map.getSource("beaches")) return;
      const accent = getAccent();

      map.addSource("beaches", {
        type: "geojson",
        data: toGeoJSON(pointsRef.current),
        cluster: true,
        clusterMaxZoom: 17, // Max zoom to cluster points on
        clusterRadius: 40, // Radius of each cluster
      });

      // Cluster circle layer
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "beaches",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": accent,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            15, // radius for clusters with < 10 points
            10,
            20, // radius for clusters with 10-99 points
            30,
            25, // radius for clusters with 100+ points
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": isDark()
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(255, 255, 255, 0.85)",
        },
      });

      // Cluster count label
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "beaches",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Bold", "Noto Sans"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0, 0, 0, 0.3)",
          "text-halo-width": 1,
        },
      });

      // Individual point — large transparent hit area (44px touch target)
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "beaches",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": accent,
          "circle-radius": 22, // 44px diameter touch target (WCAG)
          "circle-stroke-width": 2,
          "circle-stroke-color": isDark()
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(255, 255, 255, 0.85)",
          "circle-opacity": 0.2,
          "circle-stroke-opacity": 1,
        },
      });

      // Visual marker on top (smaller, fully visible)
      map.addLayer({
        id: "unclustered-point-visual",
        type: "circle",
        source: "beaches",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": accent,
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": isDark()
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(255, 255, 255, 0.85)",
        },
      });
    }

    map.on("load", () => {
      addBeachLayers();
      setTimeout(() => map.resize(), 0);
    });

    // Dark/light swap only when theme class changes. setStyle drops custom
    // sources/layers, so re-add them once the new style settles.
    const obs = new MutationObserver(() => {
      map.setStyle(styleForTheme());
      map.once("styledata", addBeachLayers);
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

    // ── Interaction handlers — registered ONCE. They are layer-id scoped, so
    // they survive style swaps and data updates without piling up. ──────────

    // Click on a cluster - zoom in or show list if can't expand
    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (
        !features.length ||
        !features[0].geometry ||
        features[0].geometry.type !== "Point"
      )
        return;

      const clusterId = features[0].properties?.cluster_id;
      const pointCount = features[0].properties?.point_count;
      const coordinates = features[0].geometry.coordinates.slice() as [
        number,
        number
      ];
      const source = map.getSource("beaches") as maplibregl.GeoJSONSource;

      const openCluster = async () => {
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);

          // If cluster can't expand further (at max zoom), show popup with all beaches
          if (zoom >= map.getMaxZoom() || zoom === map.getZoom()) {
            const leaves = await source.getClusterLeaves(
              clusterId,
              pointCount || 100,
              0
            );
            if (!leaves) return;

            const styles = getPopupStyles();
            const beachList = leaves
              .map((leaf: any) => {
                const props = leaf.properties;
                return `<a href="/beach/${props.id}" style="display: block; padding: 4px 0; text-decoration: none; color: ${styles.color}; font-weight: 500; border-bottom: 1px solid ${styles.borderColor};">${props.name}</a>`;
              })
              .join("");

            const popup = new maplibregl.Popup({
              closeButton: true,
              maxWidth: "300px",
            })
              .setLngLat(coordinates)
              .setHTML(
                `<div style="max-height: 200px; overflow-y: auto;">${beachList}</div>`
              )
              .addTo(map);

            // Apply dark mode styles to popup container
            const popupEl = popup.getElement();
            if (popupEl) {
              const content = popupEl.querySelector(".maplibregl-popup-content");
              if (content) {
                (content as HTMLElement).style.backgroundColor =
                  styles.background;
                (content as HTMLElement).style.color = styles.color;
              }
            }
          } else {
            // Otherwise, zoom in
            map.easeTo({
              center: coordinates,
              zoom: zoom ?? map.getZoom() + 2,
            });
          }
        } catch {
          // Ignore cluster expansion errors
        }
      };

      void openCluster();
    });

    // Click handler for individual points - show popup
    map.on("click", "unclustered-point", (e) => {
      if (
        !e.features?.length ||
        !e.features[0].geometry ||
        e.features[0].geometry.type !== "Point"
      )
        return;

      const coordinates = e.features[0].geometry.coordinates.slice() as [
        number,
        number
      ];
      const { name, id } = e.features[0].properties as {
        name: string;
        id: string;
      };

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const styles = getPopupStyles();
      const popup = new maplibregl.Popup({ closeButton: false })
        .setLngLat(coordinates)
        .setHTML(
          `<a href="/beach/${id}" style="text-decoration: none; color: ${styles.color}; font-weight: 500;">${name}</a>`
        )
        .addTo(map);

      // Apply dark mode styles to popup container
      const popupEl = popup.getElement();
      if (popupEl) {
        const content = popupEl.querySelector(".maplibregl-popup-content");
        if (content) {
          (content as HTMLElement).style.backgroundColor = styles.background;
          (content as HTMLElement).style.color = styles.color;
        }
      }
    });

    // Change cursor on hover
    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      obs.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []); // ← no dependencies (don't recreate the map or re-bind handlers)

  // Push new data when points change — just update the source, don't rebuild.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("beaches") as
      | maplibregl.GeoJSONSource
      | undefined;
    // If the source isn't there yet, the load/styledata handler will build it
    // from pointsRef, so there's nothing to do here.
    if (src) src.setData(toGeoJSON(points));
  }, [points]);

  // Fit to focus (center + radius) without flashing; allow closer zoom for small radii
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus?.center) return;

    map.stop(); // cancel any ongoing camera animation

    if (focus.radiusKm && focus.radiusKm > 0) {
      const r = focus.radiusKm;

      // 🔧 TIGHTEN the fit for small radii
      // - Shrink the radius a bit so bounds aren't too wide
      // - Reduce padding so more of the view is the actual area of interest
      // - Let the map zoom in a bit more
      const isSmall = r <= 5; // the 5 km "nearby" case
      const effective = isSmall ? r * 0.65 : r; // <— tighten bounds
      const padding = isSmall ? 12 : 24; // less padding on small areas
      const maxZoom = isSmall ? 17 : 14; // allow closer zoom on small areas (updated for new max)

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
