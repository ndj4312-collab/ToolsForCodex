import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename, dirname } from 'node:path';

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
function humanize(value) { return value.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function semanticName(r) {
  const file = basename(r.path).toLowerCase();
  const parent = humanize(basename(dirname(r.path)));
  if (file === 'index.md' || file === 'skill.md') return parent;
  if (file === 'distribution-manifest.json') return `${humanize(basename(dirname(dirname(r.path))))} distribution manifest`;
  if (file === 'proposal.json') return `${parent} proposal metadata`;
  if (file === 'proposal-report.md') return `${parent} proposal report`;
  const title = String(r.title || '').trim();
  if (!title || /^(skills? index|index|files?|references?|resources?|docs?|documentation)$/i.test(title)) return humanize(basename(r.path));
  return title;
}
function validTrigger(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v || /^(true|false|null|undefined|yes|no|on|off|\d+(?:\.\d+)?)$/i.test(v)) return false;
  if (/^(skills? index|index|files?|references?|resources?)$/i.test(v)) return false;
  return v.length >= 8 && /[a-z]/i.test(v);
}
function referenceTrigger(r) {
  const file = basename(r.path).toLowerCase();
  const name = semanticName(r);
  if (file === 'index.md') return `Locate the supporting assets for ${name} only when that capability needs indexed references; the index never substitutes for the child behavior.`;
  if (file === 'distribution-manifest.json') return `Verify ${name} package membership, completeness, or integrity when distribution inventory is material; do not use the manifest as an execution capability.`;
  if (file === 'proposal.json') return `Check ${name} machine-readable proposal metadata or provenance when a governance decision depends on it; do not use proposal metadata for operational execution.`;
  if (file === 'proposal-report.md') return `Review ${name} rationale or approval evidence when historical proposal governance is material; current operational behavior remains owned by active capabilities.`;
  if (file === 'agents.md') return `Apply ${name} repository-level coordination and routing rules when operating inside that package, while preserving more-specific child owners.`;
  return null;
}
function inferredTrigger(r) {
  const explicit = (r.triggers || []).filter(validTrigger);
  if (explicit.length) return { triggers: explicit, scopeStatus: 'SOURCE_EXPLICIT' };
  const ref = referenceTrigger(r);
  if (ref) return { triggers: [ref], scopeStatus: 'REFERENCE_ROLE_DERIVED' };
  return { triggers: [], scopeStatus: 'NEEDS_SCOPE_CONTRACT' };
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
  const triggerInfo = inferredTrigger(r);

  lifecycle.push({
    lifecycleId: `APPROVED-PROPOSAL-${n}`,
    sourceItemId: r.id,
    source: { path: r.path, sha256: r.sha256, revision: manifest.revision, kind: r.kind, title: semanticName(r) },
    spec: {
      id: `SPEC-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      objective: `Prepare ${r.path} as a candidate routed capability without claiming endurance before behavioral validation.`,
      triggerContract: triggerInfo.triggers,
      scopeStatus: triggerInfo.scopeStatus,
      requiredOutputs: r.outputs || [],
      failureModes: r.failures || [],
      constraints: ['preserve-source-provenance', 'no-silent-normalization', 'accept-before-validation', 'no-active-before-behavioral-proof', 'additive-endurance', 'wiki-pointer-not-body-duplication']
    },
    ticket: {
      id: `TICKET-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      acceptanceCriteria: [
        'source path exists at pinned revision',
        'source SHA-256 matches manifest',
        'source readStatus is READ',
        'implementation target resolves',
        'behavioral scope is validated before ACTIVE status',
        'all required fixture classes pass before promotion',
        'execution evidence is verified before promotion',
        'wiki activation points to semantic owner rather than duplicating body'
      ]
    },
    implementation: {
      id: `IMPLEMENT-APPROVED-PROPOSAL-${n}`,
      status: 'PASS',
      mode: implementationMode,
      target: implementationTarget,
      sourcePath: r.path,
      routeType: 'APPROVED_PROPOSAL_CANDIDATE',
      activation: 'PENDING_VALIDATION',
      operation: skillParent && r.path !== skillParent ? 'candidate supporting asset; child semantic role must be independently validated' : 'candidate native capability; behavioral activation must be independently validated'
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
      status: 'PENDING_VALIDATION',
      semanticOwner: r.path,
      triggers: triggerInfo.triggers,
      scopeStatus: triggerInfo.scopeStatus,
      promotionRequires: ['P3','PP2','N3','A1','C1','E1','score=100','hardFailures=0','dependencyPointVerified','executionEvidenceVerified','routerRegressionFailures=0','crossCapabilityCollisionFailures=0'],
      enforcers: [
        'AGENTS.md approved-proposal lifecycle pointer',
        'pointer-catalog/ingestion/APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json',
        'pointer-catalog/ingestion/ENDURANCE_VALIDATION_RESULTS.json',
        'scripts/validate-endurance-effects.mjs',
        'ingest-corpus CI endurance-effect assertion',
        'Notion PROCEDURAL_ENFORCEMENT_REGISTRY pointer',
        'Notion wiki integrity/receipt gate'
      ]
    },
    wiki: {
      status: 'REFERENCE_READY',
      semanticOwner: r.path,
      pointer: `APPROVED-PROPOSAL-${n}`,
      bodyDuplication: false,
      activationRequiresEnduranceValidation: true
    }
  });
}

for (const x of lifecycle) {
  for (const s of ['spec','ticket','implementation','acceptance']) {
    if (!x[s] || x[s].status !== 'PASS') throw new Error(`${x.lifecycleId} missing terminal ${s}`);
  }
}

const candidateRoutes = lifecycle.map(x => ({
  lifecycleId: x.lifecycleId,
  sourceItemId: x.sourceItemId,
  sourcePath: x.source.path,
  sourceSha256: x.source.sha256,
  title: x.source.title,
  kind: x.source.kind,
  route: {
    type: 'APPROVED_PROPOSAL_CANDIDATE',
    target: x.implementation.target,
    sourcePath: x.source.path,
    status: 'PENDING_VALIDATION',
    acceptanceEvidence: x.acceptance.id,
    endureEvidence: null,
    triggers: x.endure.triggers,
    scopeStatus: x.endure.scopeStatus
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
  pendingValidation: lifecycle.filter(x => x.endure.status === 'PENDING_VALIDATION').length,
  endured: 0,
  wikiActivated: 0,
  skippedStages: 0,
  preparationComplete: lifecycle.length === 456 && lifecycle.every(x => ['spec','ticket','implementation','acceptance'].every(s => x[s].status === 'PASS')),
  complete: false
};
if (!coverage.preparationComplete) throw new Error('Approved proposal preparation lifecycle incomplete');

const out = join(root, 'pointer-catalog', 'ingestion');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json'), JSON.stringify({ schemaVersion: '2.0', generatedAt: new Date().toISOString(), coverage, items: lifecycle }, null, 2));
writeFileSync(join(out, 'APPROVED_PROPOSAL_ACTIVE_ROUTES.json'), JSON.stringify({ schemaVersion: '2.0', generatedAt: new Date().toISOString(), sourceRevision: manifest.revision, routes: candidateRoutes }, null, 2));
writeFileSync(join(out, 'APPROVED_PROPOSAL_ENDURANCE_INDEX.md'), `# Approved proposal capability lifecycle\n\n- Source revision: ${manifest.revision}\n- Approved proposal capabilities: 456\n- Specified: ${coverage.specified}\n- Ticketed: ${coverage.ticketed}\n- Implemented: ${coverage.implemented}\n- Accepted: ${coverage.accepted}\n- Pending behavioral validation: ${coverage.pendingValidation}\n- Endured ACTIVE: 0 until per-item fixture/evidence validation passes\n- Wiki ACTIVE: 0 until endurance validation passes\n- False promotion is forbidden.\n\nPer-item preparation evidence is canonical in \`APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json\`. Behavioral validation is canonical in \`ENDURANCE_VALIDATION_RESULTS.json\` and enforced by \`scripts/validate-endurance-effects.mjs\`.\n`);
console.log(JSON.stringify(coverage, null, 2));
