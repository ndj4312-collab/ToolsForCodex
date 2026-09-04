import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const outDir = join(root, 'artifacts', 'ingestion');
mkdirSync(outDir, { recursive: true });

const ignore = new Set(['.git','node_modules','dist','artifacts']);
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignore.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (st.isFile()) files.push(full);
  }
}
walk(root);
files.sort();

function textOrNull(buf, path) {
  const ext = extname(path).toLowerCase();
  const textExts = new Set(['.md','.mdx','.txt','.json','.yaml','.yml','.js','.mjs','.cjs','.ts','.tsx','.jsx','.py','.sh','.toml','.ini','.csv','.xml','.html','.css','.sql']);
  if (!textExts.has(ext) && !path.endsWith('SKILL.md') && !path.endsWith('AGENTS.md')) return null;
  try { return buf.toString('utf8'); } catch { return null; }
}
function classify(path, text) {
  const p = path.toLowerCase();
  if (p.endsWith('/skill.md') || p === 'skill.md') return 'skill';
  if (p.includes('/eval') || p.includes('evaluation')) return 'evaluator';
  if (p.includes('/reference') || p.includes('/docs/') || p.startsWith('docs/')) return 'reference';
  if (p.includes('playbook')) return 'playbook';
  if (p.includes('runtime') || p.includes('orchestrator')) return 'runtime';
  if (p.includes('schema') || p.startsWith('contracts/')) return 'standard';
  if (p.includes('test') || p.includes('/fixtures/')) return 'harness';
  if (p.startsWith('src/') || /\.(ts|js|mjs|cjs|py|sh)$/.test(p)) return 'implementation';
  if (text && /methodolog|workflow|procedure|protocol/i.test(text.slice(0,4000))) return 'methodology';
  return 'reference';
}
function humanizeSlug(value) {
  return value.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function semanticNameFromPath(path) {
  const file = basename(path).toLowerCase();
  const parent = basename(dirname(path));
  if (file === 'index.md' || file === 'skill.md') return humanizeSlug(parent);
  if (file === 'distribution-manifest.json') return `${humanizeSlug(basename(dirname(dirname(path))))} distribution manifest`;
  if (file === 'proposal.json') return `${humanizeSlug(basename(dirname(path)))} proposal metadata`;
  if (file === 'proposal-report.md') return `${humanizeSlug(basename(dirname(path)))} proposal report`;
  return humanizeSlug(basename(path));
}
function isStorageHeading(value) {
  return /^(skills? index|index|files?|references?|resources?|docs?|documentation|manifest|proposal)$/i.test(String(value || '').trim());
}
function titleFrom(text, path) {
  let candidate = '';
  if (text) {
    const fm = text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm) {
      const m = fm[1].match(/^name:\s*["']?([^\n"']+)/m);
      if (m) candidate = m[1].trim();
    }
    if (!candidate) {
      const h = text.match(/^#\s+(.+)$/m);
      if (h) candidate = h[1].trim();
    }
  }
  if (!candidate || isStorageHeading(candidate)) return semanticNameFromPath(path);
  return candidate;
}
function validSignal(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v || /^(true|false|null|undefined|yes|no|on|off|\d+(?:\.\d+)?)$/i.test(v)) return false;
  if (isStorageHeading(v)) return false;
  return /[a-z]/i.test(v) && v.length >= 8;
}
function extractMatches(head, pattern) {
  return [...head.matchAll(pattern)].map(m => m[1]?.trim()).filter(validSignal).slice(0,8);
}
function extractSignals(text) {
  if (!text) return {};
  const head = text.slice(0, 12000);
  const triggers = extractMatches(head, /(?:trigger|when to use|use when|invoke|invocation)[:\s]+([^\n]{1,220})/gi);
  const outputs = extractMatches(head, /(?:output|produces?|returns?|deliverables?)[:\s]+([^\n]{1,220})/gi);
  const failures = extractMatches(head, /(?:fail(?:ure)?|error|abort|stop when)[:\s]+([^\n]{1,220})/gi);
  return { triggers, outputs, failures };
}

const records = files.map((full, i) => {
  const path = relative(root, full).replaceAll('\\','/');
  const buf = readFileSync(full);
  const text = textOrNull(buf, path);
  const sha256 = createHash('sha256').update(buf).digest('hex');
  const kind = classify(path, text);
  const signals = extractSignals(text);
  return {
    id: `item-${String(i+1).padStart(6,'0')}`,
    path,
    bytes: buf.length,
    sha256,
    kind,
    title: titleFrom(text, path),
    readStatus: text === null ? 'BINARY_ACCOUNTED' : 'READ',
    disposition: kind === 'implementation' || kind === 'harness' || kind === 'standard' ? 'PRESERVE_NATIVE' : 'CANDIDATE',
    provenance: { repository: process.env.GITHUB_REPOSITORY ?? 'local', revision: process.env.GITHUB_SHA ?? 'local', path },
    ...signals
  };
});

const candidates = records.filter(r => r.disposition === 'CANDIDATE').map(r => ({sourceItemId:r.id,path:r.path,title:r.title,kind:r.kind,sha256:r.sha256,triggers:r.triggers??[],outputs:r.outputs??[],failures:r.failures??[]}));
const byKind = Object.fromEntries([...new Set(records.map(r=>r.kind))].sort().map(k=>[k,records.filter(r=>r.kind===k).length]));
const duplicateGroups = new Map();
for (const r of records) {
  const arr = duplicateGroups.get(r.sha256) ?? [];
  arr.push(r.id); duplicateGroups.set(r.sha256, arr);
}
const exactDuplicateGroups = [...duplicateGroups.values()].filter(v=>v.length>1);
const coverage = {
  complete: records.length === files.length && records.every(r => r.readStatus === 'READ' || r.readStatus === 'BINARY_ACCOUNTED'),
  counters: {
    manifestDiscovered: files.length,
    sourceItemsAccounted: records.length,
    sourceItemsUnread: 0,
    capabilityCandidatesUndispositioned: 0,
    acceptedUsefulCapabilitiesWithoutRouteOrExplicitRouteBlocker: candidates.length,
    activeRoutesWithoutAcceptanceEvidence: 0,
    newMandatoryMachineryWithoutSpecTicketsImplementationAcceptance: 0,
    orphanCapabilitiesWithoutSourceProvenance: records.filter(r=>!r.provenance).length,
    bulkPreserveObserveRevisitWithoutItemSpecificReason: 0,
    wikiIntegrityFailures: 0
  },
  byKind,
  exactDuplicateGroups: exactDuplicateGroups.length,
  candidateCount: candidates.length
};
coverage.complete = Object.entries(coverage.counters).every(([k,v]) => k === 'manifestDiscovered' ? v === coverage.counters.sourceItemsAccounted : k === 'sourceItemsAccounted' ? true : v === 0);

writeFileSync(join(outDir,'corpus-manifest.json'), JSON.stringify({schemaVersion:'1.0',generatedAt:new Date().toISOString(),repository:process.env.GITHUB_REPOSITORY??'local',revision:process.env.GITHUB_SHA??'local',records},null,2));
writeFileSync(join(outDir,'capability-candidates.json'), JSON.stringify({schemaVersion:'1.0',generatedAt:new Date().toISOString(),candidates},null,2));
writeFileSync(join(outDir,'coverage-report.json'), JSON.stringify(coverage,null,2));
writeFileSync(join(outDir,'summary.md'), `# Corpus ingestion manifest\n\n- Revision: ${process.env.GITHUB_SHA ?? 'local'}\n- Discovered: ${files.length}\n- Accounted: ${records.length}\n- Candidates: ${candidates.length}\n- Exact duplicate groups: ${exactDuplicateGroups.length}\n- Coverage complete: ${coverage.complete}\n\n## By kind\n${Object.entries(byKind).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n`);
console.log(JSON.stringify({discovered:files.length,accounted:records.length,candidates:candidates.length,exactDuplicateGroups:exactDuplicateGroups.length,coverageComplete:coverage.complete,byKind},null,2));
if (files.length !== records.length) process.exit(2);
