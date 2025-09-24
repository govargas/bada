import { apiFetch } from "./client";
import {
  BeachSummary,
  BeachDetail,
  BeachFeatureCollection,
  featureToSummary,
} from "@/types/beaches";

// List all beaches → BeachSummary[]
export async function fetchBeaches(): Promise<BeachSummary[]> {
  const data = await apiFetch<BeachFeatureCollection>("/beaches");
  return data.features
    .map(featureToSummary)
    .filter((x): x is BeachSummary => x !== null);
}

// One beach detail
export async function fetchBeach(id: string): Promise<BeachDetail> {
  return apiFetch<BeachDetail>(`/beaches/${id}`);
}
