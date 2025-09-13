import {
  BeachSummary,
  BeachDetail,
  mapFeatureToBeachSummary,
} from "../types/beaches";

// Helper: fetch JSON with error handling
async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// List all beaches (summary)
export async function fetchBeaches(): Promise<BeachSummary[]> {
  const data = await apiGet<{ type: string; features: any[] }>("/api/beaches");
  return data.features.map(mapFeatureToBeachSummary);
}

// Get a single beach detail
export async function fetchBeach(id: string): Promise<BeachDetail> {
  return apiGet<BeachDetail>(`/api/beaches/${id}`);
}
