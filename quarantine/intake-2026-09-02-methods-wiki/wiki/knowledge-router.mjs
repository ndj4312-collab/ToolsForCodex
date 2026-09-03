import fs from "node:fs";

export function tokenize(value) {
  return [...new Set(String(value).toLowerCase().match(/[a-z0-9_-]+/g) ?? [])];
}

export function findKnowledge(map, query, limit = 5) {
  const q = new Set(tokenize(query));
  return map.concepts
    .map((entry) => {
      const hay = tokenize([
        entry.id,
        ...(entry.queries ?? []),
        entry.authority ?? "",
        ...(entry.canonical_sources ?? []),
      ].join(" "));
      let score = 0;
      for (const token of hay) if (q.has(token)) score += 1;
      if (entry.id.toLowerCase() === String(query).toLowerCase()) score += 100;
      return { id: entry.id, score, authority: entry.authority, canonical_sources: entry.canonical_sources, freshness: entry.freshness };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function loadKnowledge(map, id) {
  const entry = map.concepts.find((x) => x.id === id);
  if (!entry) throw new Error(`Unknown knowledge id: ${id}`);
  return entry;
}

if (process.argv[1] && process.argv[1].endsWith("knowledge-router.mjs")) {
  const [mapPath, query] = process.argv.slice(2);
  const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  console.log(JSON.stringify(findKnowledge(map, query), null, 2));
}
