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

export default function MapView({
  points = [],
  focus,
  onMoveEnd,
  onFitBounds,
}: Props) {
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
      maxZoom: 18, // Increased to allow more detailed zoom
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

  // Update markers with clustering support
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const accent = getAccent();
    
    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove old layers and sources if they exist
    if (map.getLayer("clusters")) map.removeLayer("clusters");
    if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
    if (map.getLayer("unclustered-point-visual")) map.removeLayer("unclustered-point-visual");
    if (map.getLayer("unclustered-point")) map.removeLayer("unclustered-point");
    if (map.getSource("beaches")) map.removeSource("beaches");

    // Create GeoJSON from points
    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.lon, p.lat],
        },
        properties: {
          id: p.id,
          name: p.name,
        },
      })),
    };

    // Add source with clustering enabled
    map.addSource("beaches", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 17, // Max zoom to cluster points on (increased for better separation)
      clusterRadius: 40, // Radius of each cluster (reduced for tighter clustering)
    });

    // Add cluster circle layer
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
          10, 20, // radius for clusters with 10-99 points
          30, 25, // radius for clusters with 100+ points
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": isDark() ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.85)",
      },
    });

    // Add cluster count label
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "beaches",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
      },
      paint: {
        "text-color": isDark() ? "#ffffff" : "#000000",
      },
    });

    // Add individual point layer (unclustered)
    // Using 22px radius (44px diameter) for proper touch targets
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "beaches",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": accent,
        "circle-radius": 22, // 44px diameter for proper touch target (WCAG compliance)
        "circle-stroke-width": 2,
        "circle-stroke-color": isDark() ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.85)",
        "circle-opacity": 0.2, // Make it mostly transparent
        "circle-stroke-opacity": 1,
      },
    });

    // Add visual marker layer on top (smaller, fully visible)
    map.addLayer({
      id: "unclustered-point-visual",
      type: "circle",
      source: "beaches",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": accent,
        "circle-radius": 8, // Visual size (16px diameter)
        "circle-stroke-width": 2,
        "circle-stroke-color": isDark() ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.85)",
      },
    });

    // Click handler for clusters - zoom in or show list if can't expand
    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (!features.length || !features[0].geometry || features[0].geometry.type !== "Point") return;

      const clusterId = features[0].properties?.cluster_id;
      const pointCount = features[0].properties?.point_count;
      const coordinates = features[0].geometry.coordinates.slice() as [number, number];
      const source = map.getSource("beaches") as maplibregl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        // If cluster can't expand further (at max zoom), show popup with all beaches
        if (zoom >= map.getMaxZoom() || zoom === map.getZoom()) {
          source.getClusterLeaves(clusterId, pointCount || 100, 0, (error, leaves) => {
            if (error || !leaves) return;

            const beachList = leaves
              .map((leaf: any) => {
                const props = leaf.properties;
                return `<a href="/beach/${props.id}" style="display: block; padding: 4px 0; text-decoration: none; color: inherit; font-weight: 500; border-bottom: 1px solid rgba(128,128,128,0.2);">${props.name}</a>`;
              })
              .join("");

            new maplibregl.Popup({ closeButton: true, maxWidth: "300px" })
              .setLngLat(coordinates)
              .setHTML(`<div style="max-height: 200px; overflow-y: auto;">${beachList}</div>`)
              .addTo(map);
          });
        } else {
          // Otherwise, zoom in
          map.easeTo({
            center: coordinates,
            zoom: zoom ?? map.getZoom() + 2,
          });
        }
      });
    });

    // Click handler for individual points - show popup
    map.on("click", "unclustered-point", (e) => {
      if (!e.features?.length || !e.features[0].geometry || e.features[0].geometry.type !== "Point") return;
      
      const coordinates = e.features[0].geometry.coordinates.slice() as [number, number];
      const { name, id } = e.features[0].properties as { name: string; id: string };

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new maplibregl.Popup({ closeButton: false })
        .setLngLat(coordinates)
        .setHTML(
          `<a href="/beach/${id}" style="text-decoration: none; color: inherit; font-weight: 500;">${name}</a>`
        )
        .addTo(map);
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
