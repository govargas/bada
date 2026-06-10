// Builds a slim, static snapshot of all EU bathing waters in Sweden.
//
// The beach LIST (locations + names) changes only a few times a year, so we
// snapshot it at deploy time and serve it from the CDN instead of proxying
// HaV on every first page load. This removes the serverless cold-start +
// large-GeoJSON round trip from the critical path.
//
// The generated file is committed to the repo, so a deploy never depends on
// HaV being up. A scheduled GitHub Action re-runs this daily and commits any
// changes (see .github/workflows/refresh-beaches.yml).
//
// Run manually: `node scripts/build-beaches.mjs`

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HAV_BASE_URL =
  process.env.HAV_BASE_URL ?? "https://badplatsen.havochvatten.se/badplatsen/api";
const HAV_USER_AGENT =
  process.env.HAV_USER_AGENT ?? "BADA-build/1.0 (https://github.com/govargas/bada)";

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../frontend/public/beaches.json"
);

async function main() {
  const url = `${HAV_BASE_URL}/feature/?format=json`;
  console.log(`Fetching ${url}`);

  const res = await fetch(url, {
    headers: { "User-Agent": HAV_USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`HaV feature endpoint: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const beaches = (data.features ?? [])
    .map((f) => {
      const p = f.properties;
      const coords = f.geometry?.coordinates;
      if (!p || !coords) return null;
      const [lon, lat] = coords;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      return {
        id: p.NUTSKOD ?? f.id ?? "",
        name: p.NAMN ?? "Okänd",
        municipality: p.KMN_NAMN ?? "",
        lat,
        lon,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  if (beaches.length === 0) {
    throw new Error("Refusing to write an empty snapshot");
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(beaches));
  console.log(`Wrote ${beaches.length} beaches → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
