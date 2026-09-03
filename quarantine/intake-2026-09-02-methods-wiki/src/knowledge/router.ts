export type KnowledgeEntry = {
  id: string;
  queries: string[];
  canonical_sources: string[];
  authority: string;
  freshness: string;
  derived_summary?: string;
  conflicts?: string[];
};

export type KnowledgeMap = {
  schema_version: number;
  derived: true;
  canon_rule: string;
  concepts: KnowledgeEntry[];
};

function tokens(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z0-9_-]+/g) ?? []);
}

export function findKnowledge(map: KnowledgeMap, query: string, limit = 5) {
  const q = tokens(query);
  return map.concepts
    .map((entry) => {
      const hay = tokens([entry.id, ...entry.queries, entry.authority, ...entry.canonical_sources].join(" "));
      let score = 0;
      for (const token of hay) if (q.has(token)) score += 1;
      if (entry.id.toLowerCase() === query.toLowerCase()) score += 100;
      return { ...entry, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, Math.max(1, Math.min(limit, 20)));
}

export function loadKnowledge(map: KnowledgeMap, id: string): KnowledgeEntry {
  const entry = map.concepts.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown knowledge id: ${id}`);
  return entry;
}
