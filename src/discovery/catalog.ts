import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { OrchestratorConfig } from "../config/types";
import type { CatalogAsset, CatalogResult, Diagnostic } from "../domain/records";
import { stableStringify, sha256, writeJson } from "../utils/files";
import { classify } from "../classification/rules";
import { discover } from "./walker";
import { parseRecord } from "./parsers";

const DETERMINISTIC_TIMESTAMP = "1970-01-01T00:00:00.000Z";

export function buildCatalog(targetRoot: string, config: OrchestratorConfig): CatalogResult {
  const { records, exclusions } = discover(targetRoot, config.auditIgnore);
  const diagnostics: Diagnostic[] = [];
  const rawAssets: CatalogAsset[] = records.map((record, index) => {
    const parsed = parseRecord(record);
    diagnostics.push(...parsed.diagnostics);
    const classification = classify(record);
    return { id: `asset-${String(index + 1).padStart(6, "0")}`, path: record.path, kind: record.kind, ...(record.sha256 ? { sha256: record.sha256 } : {}), ...(record.size === undefined ? {} : { size: record.size }), parseStatus: record.parseStatus, ...(record.reason ? { reason: record.reason } : {}), classifications: classification.domains };
  });
  const grouped = new Map<string, typeof rawAssets[number]>();
  for (const asset of rawAssets) {
    const key = asset.sha256 ? `${asset.sha256}:${asset.classifications[0] ?? "UNKNOWN"}:${asset.kind}` : `${asset.path}:${asset.kind}`;
    const existing = grouped.get(key);
    if (!existing) grouped.set(key, asset);
    else grouped.set(key, { ...existing, locations: [...(existing.locations ?? [existing.path]), asset.path] });
  }
  const assets = [...grouped.values()].map((asset, index) => ({ ...asset, id: `asset-${String(index + 1).padStart(6, "0")}` }));
  const normalized = { targetPath: ".", exclusions, assets };
  const overallDigest = sha256(stableStringify(normalized));
  return { schemaVersion: "1.0", id: "catalog-orchestrator", generatedAt: DETERMINISTIC_TIMESTAMP, targetPath: ".", exclusions, assets, overallDigest, evidence: [{ kind: "deterministic-discovery", locator: `file://${targetRoot}` }], diagnostics };
}

export function writeCatalogOutputs(targetRoot: string, config: OrchestratorConfig): CatalogResult {
  const catalog = buildCatalog(targetRoot, config);
  const output = resolve(targetRoot, config.outputDirectory);
  mkdirSync(output, { recursive: true });
  writeJson(join(output, "catalog.json"), catalog);
  writeJson(join(output, "diagnostics.json"), catalog.diagnostics);
  const markdown = [`# Repository catalog`, ``, `Digest: \`${catalog.overallDigest}\``, ``, `| Path | Kind | Parse | Classification |`, `| --- | --- | --- | --- |`, ...catalog.assets.map((asset) => `| ${asset.path} | ${asset.kind} | ${asset.parseStatus} | ${asset.classifications.join(", ")} |`), ``].join("\n");
  writeFileSync(join(output, "catalog.md"), markdown, "utf8");
  return catalog;
}
