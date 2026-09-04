import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const expected = 456;
const requiredClasses = {
  positive: 3,
  paraphrase: 2,
  negative: 3,
  ambiguity: 1,
  composition: 1,
  executionEvidence: 1,
};
const hardFailureKeys = [
  'falseNegativePositive',
  'falsePositiveNegative',
  'paraphraseFailure',
  'wrongSemanticOwner',
  'wrongDependencyPoint',
  'mentionOnlyActivation',
  'parentInsteadOfChild',
  'genericRouteSuppressesChild',
  'unnecessaryComposition',
  'missingComplementaryCapability',
  'routingWithoutExecution',
  'outputWithoutEvidence',
  'unavailableMachineryMarkedActive',
];

const lifecyclePath = join(root, 'pointer-catalog', 'ingestion', 'APPROVED_PROPOSAL_LIFECYCLE_REGISTRY.json');
const resultsPath = join(root, 'pointer-catalog', 'ingestion', 'ENDURANCE_VALIDATION_RESULTS.json');
const reportPath = join(root, 'pointer-catalog', 'ingestion', 'ENDURANCE_VALIDATION_COVERAGE.json');

if (!existsSync(lifecyclePath)) throw new Error(`Missing lifecycle registry: ${lifecyclePath}`);
const lifecycle = JSON.parse(readFileSync(lifecyclePath, 'utf8'));
if (!Array.isArray(lifecycle.items) || lifecycle.items.length !== expected) {
  throw new Error(`Lifecycle denominator must be ${expected}; found ${lifecycle.items?.length ?? 0}`);
}

function genericScopeDefects(item) {
  const defects = [];
  const strings = JSON.stringify(item);
  if (/"true"/i.test(strings)) defects.push('literal-scalar-trigger');
  if (/semantically matches Skills index/i.test(strings)) defects.push('generic-skills-index-trigger');
  if (/When the user asks for work whose goal is Skills index/i.test(strings)) defects.push('generic-skills-index-scope');
  if (/When a task semantically matches .*? or explicitly requests approved-proposals\//i.test(strings)) defects.push('path-title-fallback-trigger');
  if (/explicitly requests or depends on the semantic behavior owned by approved-proposals\//i.test(strings)) defects.push('path-owned-semantic-placeholder');
  return defects;
}

const compilerDefects = lifecycle.items.flatMap(item => genericScopeDefects(item).map(defect => ({ lifecycleId: item.lifecycleId, defect })));

let results = { schemaVersion: '1.0', items: [] };
if (existsSync(resultsPath)) results = JSON.parse(readFileSync(resultsPath, 'utf8'));
if (!Array.isArray(results.items)) throw new Error('ENDURANCE_VALIDATION_RESULTS.json must contain an items array');
const byId = new Map(results.items.map(x => [x.lifecycleId, x]));

const evaluated = [];
for (const item of lifecycle.items) {
  const r = byId.get(item.lifecycleId);
  const missing = [];
  if (!r) {
    missing.push('validation-result');
  } else {
    for (const [key, count] of Object.entries(requiredClasses)) {
      const fixtures = r.fixtures?.[key];
      if (!Array.isArray(fixtures) || fixtures.length !== count) missing.push(`${key}:${count}`);
      else if (fixtures.some(f => f?.passed !== true)) missing.push(`${key}:failed`);
    }
  }
  const hardFailures = r?.hardFailures || [];
  const unknownHardFailures = hardFailures.filter(x => !hardFailureKeys.includes(x.type));
  const score = Number(r?.score ?? 0);
  const runtimeAvailable = r?.runtime?.available === true;
  const referenceOnly = r?.classification === 'REFERENCE';
  const blocked = r?.classification === 'BLOCKED';
  const evidenceVerified = r?.executionEvidenceVerified === true;
  const compilerIssues = compilerDefects.filter(x => x.lifecycleId === item.lifecycleId).map(x => x.defect);
  const fixtureComplete = missing.length === 0;
  const zeroHardFailures = hardFailures.length === 0;
  const promotableActive = fixtureComplete && score === 100 && zeroHardFailures && runtimeAvailable && evidenceVerified && compilerIssues.length === 0;
  const promotableReference = fixtureComplete && score === 100 && zeroHardFailures && referenceOnly && evidenceVerified && compilerIssues.length === 0;
  const promotableBlocked = fixtureComplete && score === 100 && zeroHardFailures && blocked && !runtimeAvailable && evidenceVerified && Boolean(r?.runtime?.blocker);
  const status = promotableActive ? 'VALIDATED_ACTIVE' : promotableReference ? 'VALIDATED_REFERENCE' : promotableBlocked ? 'VALIDATED_BLOCKED' : 'UNVALIDATED';
  evaluated.push({ lifecycleId: item.lifecycleId, status, score, fixtureComplete, hardFailureCount: hardFailures.length, missing, compilerIssues, runtimeAvailable, evidenceVerified, unknownHardFailures });
}

const coverage = {
  expected,
  contractsMaterialized: lifecycle.items.length,
  contractsFixtureComplete: evaluated.filter(x => x.fixtureComplete).length,
  contractsScore100: evaluated.filter(x => x.score === 100).length,
  contractsWithHardFailures: evaluated.filter(x => x.hardFailureCount > 0).length,
  contractsWithUnresolvedScope: evaluated.filter(x => x.missing.length > 0).length,
  contractsWithGenericPlaceholderScope: evaluated.filter(x => x.compilerIssues.length > 0).length,
  contractsWithMissingSemanticOwner: lifecycle.items.filter(x => !x.endure?.semanticOwner).length,
  contractsWithMissingDependencyPoint: evaluated.filter(x => byId.get(x.lifecycleId)?.dependencyPointVerified !== true).length,
  contractsWithMissingExecutionEvidence: evaluated.filter(x => !x.evidenceVerified).length,
  crossCapabilityCollisionFailures: Number(results.crossCapabilityCollisionFailures ?? -1),
  routerRegressionFailures: Number(results.routerRegressionFailures ?? -1),
  validatedActive: evaluated.filter(x => x.status === 'VALIDATED_ACTIVE').length,
  validatedReference: evaluated.filter(x => x.status === 'VALIDATED_REFERENCE').length,
  validatedBlocked: evaluated.filter(x => x.status === 'VALIDATED_BLOCKED').length,
};
coverage.complete = coverage.contractsMaterialized === expected &&
  coverage.contractsFixtureComplete === expected &&
  coverage.contractsScore100 === expected &&
  coverage.contractsWithHardFailures === 0 &&
  coverage.contractsWithUnresolvedScope === 0 &&
  coverage.contractsWithGenericPlaceholderScope === 0 &&
  coverage.contractsWithMissingSemanticOwner === 0 &&
  coverage.contractsWithMissingDependencyPoint === 0 &&
  coverage.contractsWithMissingExecutionEvidence === 0 &&
  coverage.crossCapabilityCollisionFailures === 0 &&
  coverage.routerRegressionFailures === 0 &&
  evaluated.every(x => x.status !== 'UNVALIDATED');

mkdirSync(join(root, 'pointer-catalog', 'ingestion'), { recursive: true });
writeFileSync(reportPath, JSON.stringify({ schemaVersion: '1.0', coverage, items: evaluated }, null, 2));
console.log(JSON.stringify(coverage, null, 2));
if (!coverage.complete) {
  console.error('Endurance-effect validation is incomplete. Lifecycle labels are not promotion evidence.');
  process.exit(10);
}
