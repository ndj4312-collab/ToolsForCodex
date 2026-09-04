export const IDEALIZE_RELATIONS = [
  "REQUIRES",
  "BLOCKS",
  "PARALLEL_WITH",
  "CONFLICTS_WITH",
  "PRODUCES",
  "CONSUMES",
  "VERIFIES",
  "FALLBACK_FOR",
] as const;

export type IdealizeRelation = (typeof IDEALIZE_RELATIONS)[number];

export type IdealizeEdge = {
  from: string;
  to: string;
  relation: IdealizeRelation;
};

export type IdealizeTask = {
  id: string;
  requirementIds: string[];
  action: string;
  rationale: string;
  owner: string;
  surface: string;
  runtime: string;
  capability: string;
  prerequisites: string[];
  inputs: string[];
  outputs: string[];
  permissions: string[];
  readSet: string[];
  writeSet: string[];
  executionClass: "READ_ONLY" | "REVERSIBLE_MUTATION" | "IRREVERSIBLE_MUTATION" | "PRIVILEGED" | "HUMAN_DECISION" | "AGENT_EXECUTABLE";
  phase: number;
  wave: number;
  parallel: boolean;
  acceptance: string;
  evidence: string[];
  failure: string;
  branch: string;
  workaround: string;
  fallback: string;
  rollback: string;
  escalation: string;
  downstreamUnlocks: string[];
  canonicalDestination: string;
};

export type IdealProjectPlan = {
  schemaVersion: string;
  idea: string;
  perfectedState: string;
  canonicalSources: string[];
  requirements: Array<{ id: string; statement: string; evidence: string[] }>;
  tasks: IdealizeTask[];
  edges: IdealizeEdge[];
  gates: Array<{ id: string; afterWave: number; evidence: string[] }>;
  residualRisks: string[];
};

export type PlanFinding = {
  code: string;
  message: string;
  taskId?: string;
};

function cycleFindings(taskIds: Set<string>, edges: IdealizeEdge[]): PlanFinding[] {
  const dependencies = new Map<string, string[]>();
  for (const id of taskIds) dependencies.set(id, []);
  for (const edge of edges) {
    if (edge.relation === "REQUIRES" && taskIds.has(edge.from) && taskIds.has(edge.to)) {
      dependencies.get(edge.from)!.push(edge.to);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const findings: PlanFinding[] = [];
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      findings.push({ code: "DEPENDENCY_CYCLE", message: `Dependency cycle reaches ${id}`, taskId: id });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of dependencies.get(id) ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of taskIds) visit(id);
  return findings;
}

export function validateIdealProjectPlan(plan: IdealProjectPlan): { status: "VERIFIED" | "BLOCKED"; findings: PlanFinding[] } {
  const findings: PlanFinding[] = [];
  const taskIds = new Set<string>();
  const requirementIds = new Set(plan.requirements.map((requirement) => requirement.id));
  for (const task of plan.tasks) {
    if (taskIds.has(task.id)) findings.push({ code: "DUPLICATE_TASK", message: `Duplicate task ${task.id}`, taskId: task.id });
    taskIds.add(task.id);
    if (task.requirementIds.length === 0) findings.push({ code: "ORPHAN_TASK", message: "Task has no requirement", taskId: task.id });
    for (const id of task.requirementIds) {
      if (!requirementIds.has(id)) findings.push({ code: "UNKNOWN_REQUIREMENT", message: `Unknown requirement ${id}`, taskId: task.id });
    }
    if (task.evidence.length === 0) findings.push({ code: "MISSING_EVIDENCE", message: "Task has no acceptance evidence", taskId: task.id });
    if (!/^IF\b.+\bTHEN\b/is.test(task.branch)) findings.push({ code: "INVALID_BRANCH", message: "Task lacks executable IF/THEN behavior", taskId: task.id });
    if (task.parallel && task.writeSet.length > 0 && !task.rollback) findings.push({ code: "UNSAFE_PARALLEL_WRITE", message: "Parallel writer lacks rollback", taskId: task.id });
  }
  for (const task of plan.tasks) {
    for (const prerequisite of task.prerequisites) {
      if (!taskIds.has(prerequisite)) {
        findings.push({ code: "UNKNOWN_PREREQUISITE", message: `${task.id} references unknown prerequisite ${prerequisite}`, taskId: task.id });
        continue;
      }
      if (!plan.edges.some((edge) => edge.relation === "REQUIRES" && edge.from === task.id && edge.to === prerequisite)) {
        findings.push({ code: "PREREQUISITE_EDGE_DRIFT", message: `${task.id} prerequisite ${prerequisite} lacks matching REQUIRES edge`, taskId: task.id });
      }
    }
  }
  for (const edge of plan.edges) {
    if (!taskIds.has(edge.from) || !taskIds.has(edge.to)) {
      findings.push({ code: "DANGLING_EDGE", message: `Edge ${edge.from} -> ${edge.to} is dangling` });
      continue;
    }
    if (edge.relation === "REQUIRES") {
      const task = plan.tasks.find((candidate) => candidate.id === edge.from)!;
      const dependency = plan.tasks.find((candidate) => candidate.id === edge.to)!;
      if (!task.prerequisites.includes(edge.to)) findings.push({ code: "PREREQUISITE_DRIFT", message: `${edge.from} omits prerequisite ${edge.to}`, taskId: edge.from });
      if (dependency.wave >= task.wave) findings.push({ code: "INVALID_WAVE_ORDER", message: `${edge.to} must finish before ${edge.from}`, taskId: edge.from });
    }
  }
  for (let left = 0; left < plan.tasks.length; left += 1) {
    for (let right = left + 1; right < plan.tasks.length; right += 1) {
      const a = plan.tasks[left]!;
      const b = plan.tasks[right]!;
      const overlap = a.writeSet.filter((path) => b.writeSet.includes(path));
      if (a.parallel && b.parallel && a.wave === b.wave && overlap.length > 0) findings.push({ code: "PARALLEL_WRITE_COLLISION", message: `${a.id} and ${b.id} both write ${overlap.join(", ")}` });
    }
  }
  for (const requirement of plan.requirements) {
    if (!plan.tasks.some((task) => task.requirementIds.includes(requirement.id))) {
      findings.push({ code: "ORPHAN_REQUIREMENT", message: `Requirement ${requirement.id} has no implementing task` });
    }
  }
  findings.push(...cycleFindings(taskIds, plan.edges));
  return { status: findings.length === 0 ? "VERIFIED" : "BLOCKED", findings };
}

export function eligibleTasks(plan: IdealProjectPlan, completed: ReadonlySet<string>): IdealizeTask[] {
  return plan.tasks
    .filter((task) => !completed.has(task.id) && task.prerequisites.every((id) => completed.has(id)))
    .sort((a, b) => a.phase - b.phase || a.wave - b.wave || a.id.localeCompare(b.id));
}
