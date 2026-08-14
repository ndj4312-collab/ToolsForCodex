import type { ClassificationDomain, DiscoveredRecord } from "../domain/records";
import { parseRecord } from "../discovery/parsers";

interface Rule { readonly id: string; readonly domain: ClassificationDomain; readonly matches: (record: DiscoveredRecord) => boolean }

const rules: readonly Rule[] = [
  { id: "domain-cross-agent-skill", domain: "Cross-Agent Tools", matches: (record) => /(^|\/)SKILL\.md$/i.test(record.path) || /(^|\/)agents\//i.test(record.path) },
  { id: "domain-ci-workflow", domain: "CI/CD & Automation", matches: (record) => /(^|\/)\.github\/workflows\//i.test(record.path) || /(^|\/)Dockerfile$/i.test(record.path) },
  { id: "domain-security", domain: "Security", matches: (record) => /security|secret|credential|auth/i.test(record.path) },
  { id: "domain-testing", domain: "Testing", matches: (record) => /(^|\/)(test|tests|spec|__tests__)\//i.test(record.path) || /\.(test|spec)\./i.test(record.path) },
  { id: "domain-build", domain: "Build Tooling", matches: (record) => /(^|\/)(package\.json|tsconfig\.json|Makefile|webpack|vite|eslint)/i.test(record.path) },
  { id: "domain-documentation", domain: "Documentation", matches: (record) => /(^|\/)(README|CHANGELOG|docs?)(\.|\/|$)/i.test(record.path) || /\.(md|mdx)$/i.test(record.path) },
  { id: "domain-data", domain: "Data", matches: (record) => /\.(csv|tsv|parquet|sqlite|sql)$/i.test(record.path) },
  { id: "domain-observability", domain: "Observability", matches: (record) => /log|metric|trace|telemetry|observability/i.test(record.path) },
  { id: "domain-deployment", domain: "Deployment", matches: (record) => /deploy|release|terraform|wrangler|kubernetes|\.dockerfile/i.test(record.path) }
];

export function classify(record: DiscoveredRecord): { domains: readonly ClassificationDomain[]; ruleIds: readonly string[] } {
  const parsed = parseRecord(record).parsed;
  const explicit = parsed?.kind === "json" && typeof parsed.data.domain === "string" ? parsed.data.domain as ClassificationDomain : undefined;
  const matches = rules.filter((rule) => rule.matches(record));
  if (explicit && rules.some((rule) => rule.domain === explicit)) return { domains: [explicit], ruleIds: rules.filter((rule) => rule.domain === explicit).map((rule) => rule.id) };
  const domains = [...new Set(matches.map((rule) => rule.domain))];
  if (domains.length === 0) return { domains: [record.kind === "file" ? "Unsupported" : "UNKNOWN"], ruleIds: [] };
  if (domains.length > 1) return { domains: ["UNKNOWN", ...domains], ruleIds: matches.map((rule) => rule.id) };
  return { domains, ruleIds: matches.map((rule) => rule.id) };
}
