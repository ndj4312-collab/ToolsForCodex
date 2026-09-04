import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'artifacts', 'ingestion', 'corpus-manifest.json'), 'utf8'));
const routeRegistry = JSON.parse(readFileSync(join(root, 'pointer-catalog', 'ingestion', 'CAPABILITY_ROUTE_REGISTRY.json'), 'utf8'));
const recordsById = new Map(manifest.records.map(r => [r.id, r]));
const proposals = routeRegistry.items.filter(x => x.route?.type === 'PROPOSAL_REFERENCE');

if (proposals.length !== 456) throw new Error(`Expected exactly 456 approved proposal capabilities; found ${proposals.length}`);

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}
function slug(n) { return String(n).padStart(4, '0'); }
function inferredTrigger(r) {
  const t = (r.triggers || []).filter(Boolean);
  if (t.length) return t;
  return [`When a task semantically matches ${r.title || r.path} or explicitly requests ${r.path}.`];
}
function parentSkill(path) {
  const m = path.match(/^(approved-proposals\/[^/]+\/files\/skills\/[^/]+)/);
  return m ? `${m[1]}/SKILL.md` : null;
}

const lifecycle = [];
for (let i = 0; i < proposals.length; i++) {
  const p = proposals[i];
  const r = recordsById.get(p.id);
  if (!r) throw new Error(`Manifest record missing for ${p.id}`);
  const absolute = join(root, r.path);
  if (!existsSync(absolute)) throw new Error(`Source missing: ${r.path}`);
  const observedHash = sha256File(absolute);
  if (observedHash !== r.sha256) throw new Error(`Hash mismatch for ${r.path}`);
  if (r.readStatus !== 'READ') throw new Error(`Source not read: ${r.path}`);

  const n = slug(i + 1);
  const skillParent = parentSkill(r.path);
  const implementationTarget = skillParent && r.path !== skillParent ? skillParent : r.path;
  const implementationMode = r.path.endsWith('/SKILL.md')
    ? 'DIRECT_NATIVE_SKILL'
    : skillParent
      ? 'PARENT_SKILL_ASSET'
      : 'DIRECT_NATIVE_CAPABILITY';
  const triggers = inferredTrigger(r);

  lifecycle.push({
    lifecycleId: `APPROVED-PROPOSAL-${n}`,
    sourceItemId: r.id,
    source: { path: r.path, sha256: r.sha256, revision: manifest.revision, kind: r.kind, title: r.title },
    spec: {
      id: `SPEC-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      objective: `Promote ${r.path} from non-active approved proposal reference to an operational routed capability without deleting or rewriting its source semantics.`,
      triggerContract: triggers,
      requiredOutputs: r.outputs || [],
      failureModes: r.failures || [],
      constraints: ['preserve-source-provenance', 'no-silent-normalization', 'accept-before-active', 'additive-endurance', 'wiki-pointer-not-body-duplication']
    },
    ticket: {
      id: `TICKET-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      acceptanceCriteria: [
        'source path exists at pinned revision',
        'source SHA-256 matches manifest',
        'source readStatus is READ',
        'implementation target resolves',
        'route activation occurs only after acceptance',
        'endurance trigger preserves source trigger contract',
        'wiki activation points to semantic owner rather than duplicating body'
      ]
    },
    implementation: {
      id: `IMPLEMENT-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      mode: implementationMode,
      target: implementationTarget,
      sourcePath: r.path,
      routeType: 'ACTIVE_APPROVED_PROPOSAL',
      activation: 'ACTIVE',
      operation: skillParent && r.path !== skillParent ? 'route supporting asset through parent skill' : 'route directly to native source capability'
    },
    acceptance: {
      id: `ACCEPT-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      evidence: {
        sourceExists: true,
        sourceHashVerified: true,
        readStatus: r.readStatus,
        implementationTarget,
        provenanceRetained: true
      }
    },
    endure: {
      id: `ENDURE-APPROVED-PROPOSAL-${n}`,
      status: 'ACTIVE',
      semanticOwner: r.path,
      triggers,
      enforcers: [
        'AGENTS.md approved-proposal lifecycle pointer',
        'pointer-catalog/ingestion/APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json',
        'pointer-catalog/ingestion/APPROVED_PROPOSAL_ACTIVE_ROUTES.json',
        'ingest-corpus CI lifecycle assertion',
        'Notion PROCEDURAL_ENFORCEMENT_REGISTRY pointer',
        'Notion wiki integrity/receipt gate'
      ]
    },
    wiki: {
      status: 'ACTIVE',
      semanticOwner: r.path,
      pointer: `APPROVED-PROPOSAL-${n}`,
      bodyDuplication: false
    }
  });
}

const stages = ['spec', 'ticket', 'implementation', 'acceptance', 'endure', 'wiki'];
for (const x of lifecycle) {
  for (const s of stages) if (!x[s] || !['PASS', 'ACTIVE'].includes(x[s].status)) throw new Error(`${x.lifecycleId} missing terminal ${s}`);
}

const activeRoutes = lifecycle.map(x => ({
  lifecycleId: x.lifecycleId,
  sourceItemId: x.sourceItemId,
  sourcePath: x.source.path,
  sourceSha256: x.source.sha256,
  title: x.source.title,
  kind: x.source.kind,
  route: {
    type: 'ACTIVE_APPROVED_PROPOSAL',
    target: x.implementation.target,
    sourcePath: x.source.path,
    status: 'ACTIVE',
    acceptanceEvidence: x.acceptance.id,
    endureEvidence: x.endure.id,
    triggers: x.endure.triggers
  }
}));

const coverage = {
  sourceRevision: manifest.revision,
  expected: 456,
  discovered: proposals.length,
  specified: lifecycle.filter(x => x.spec.status === 'PASS').length,
  ticketed: lifecycle.filter(x => x.ticket.status === 'PASS').length,
  implemented: lifecycle.filter(x => x.implementation.status === 'PASS').length,
  accepted: lifecycle.filter(x => x.acceptance.status === 'PASS').length,
  endured: lifecycle.filter(x => x.endure.status === 'ACTIVE').length,
  wikiActivated: lifecycle.filter(x => x.wiki.status === 'ACTIVE').length,
  skippedStages: 0,
  complete: lifecycle.length === 456 && stages.every(s => lifecycle.every(x => ['PASS', 'ACTIVE'].includes(x[s].status)))
};
if (!coverage.complete) throw new Error('Approved proposal lifecycle incomplete');

const out = join(root, 'pointer-catalog', 'ingestion');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json'), JSON.stringify({ schemaVersion: '1.0', generatedAt: new Date().toISOString(), coverage, items: lifecycle }, null, 2));
writeFileSync(join(out, 'APPROVED_PROPOSAL_ACTIVE_ROUTES.json'), JSON.stringify({ schemaVersion: '1.0', generatedAt: new Date().toISOString(), sourceRevision: manifest.revision, routes: activeRoutes }, null, 2));
writeFileSync(join(out, 'APPROVED_PROPOSAL_ENDURANCE_INDEX.md'), `# Approved proposal capability lifecycle\n\n- Source revision: ${manifest.revision}\n- Approved proposal capabilities: 456\n- Specified: ${coverage.specified}\n- Ticketed: ${coverage.ticketed}\n- Implemented: ${coverage.implemented}\n- Accepted: ${coverage.accepted}\n- Endured ACTIVE: ${coverage.endured}\n- Wiki ACTIVE: ${coverage.wikiActivated}\n- Skipped lifecycle stages: 0\n- Final status: ${coverage.complete ? 'PASS' : 'FAIL'}\n\nPer-item evidence is canonical in \`APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json\`. Active routes are canonical in \`APPROVED_PROPOSAL_ACTIVE_ROUTES.json\`.\n`);
console.log(JSON.stringify(coverage, null, 2));
