import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface KnowledgeEntry {
  id: string;
  queries: string[];
  summary: string;
  authority: string;
  canonical_sources: string[];
  derived_sources?: string[];
  freshness: string;
  conflicts?: string[];
}

export interface KnowledgeMap {
  schema_version: number;
  derived: true;
  canon_rule: string;
  concepts: KnowledgeEntry[];
}

export interface KnowledgeMatch {
  id: string;
  score: number;
  authority: string;
  freshness: string;
  conflicts: string[];
  canonical_sources: string[];
}

function tokens(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9_-]+/g) ?? [])];
}

export function resolveKnowledgeMapPath(targetRoot: string): string {
  const candidates = [
    resolve(targetRoot, "knowledge", "knowledge-map.json"),
    resolve(targetRoot, "wiki", "knowledge-map.json"),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("No knowledge map found. Expected knowledge/knowledge-map.json or wiki/knowledge-map.json");
  return found;
}

export function loadKnowledgeMap(targetRoot: string): KnowledgeMap {
  const path = resolveKnowledgeMapPath(targetRoot);
  const map = JSON.parse(readFileSync(path, "utf8")) as KnowledgeMap;
  if (map.derived !== true || !Array.isArray(map.concepts)) throw new Error(`Invalid knowledge map: ${path}`);
  return map;
}

export function findKnowledge(map: KnowledgeMap, query: string, limit = 5): KnowledgeMatch[] {
  const q = new Set(tokens(query));
  return map.concepts
    .map((entry) => {
      const haystack = tokens([entry.id, entry.summary, ...entry.queries, entry.authority, ...entry.canonical_sources].join(" "));
      let score = 0;
      for (const token of haystack) if (q.has(token)) score += 1;
      if (entry.id.toLowerCase() === query.toLowerCase()) score += 100;
      return {
        id: entry.id,
        score,
        authority: entry.authority,
        freshness: entry.freshness,
        conflicts: entry.conflicts ?? [],
        canonical_sources: entry.canonical_sources,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function loadKnowledge(map: KnowledgeMap, id: string): KnowledgeEntry & { canon_rule: string; derived: true } {
  const entry = map.concepts.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown knowledge id: ${id}`);
  return { ...entry, canon_rule: map.canon_rule, derived: true };
}

export function findProjectKnowledge(targetRoot: string, query: string, limit = 5): KnowledgeMatch[] {
  return findKnowledge(loadKnowledgeMap(targetRoot), query, limit);
}

export function loadProjectKnowledge(targetRoot: string, id: string): KnowledgeEntry & { canon_rule: string; derived: true } {
  return loadKnowledge(loadKnowledgeMap(targetRoot), id);
}
