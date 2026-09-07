#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const ROOT = process.cwd();
const MANIFEST_PATH = resolve(ROOT, "skills/traverse/evals/behavioral-analysis-manifest.json");
const RESULTS_DIR = resolve(ROOT, "skills/traverse/evals/results");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const targetCommit = manifest.target_commit;
const runId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT || "1";
const resultPath = join(RESULTS_DIR, `run-${runId}-${runAttempt}.json`);
const latestPath = join(RESULTS_DIR, "latest.json");

const TARGET_PATHS = [
  "skills/traverse/SKILL.md",
  "skills/traverse/references/traverse-context.md",
  "skills/traverse/evals/evals.json",
  "skills/traverse/scripts/validate_traversal_receipt.py",
];

const HARD_FAIL_RULES = [
  "premature SUCCESS before exact frozen end-state satisfaction",
  "in-place mutation/shrinkage of frozen target or denominator",
  "frontier closure without full-regression PASS",
  "fourth recovery retry after three cumulative failed recovery cycles",
  "reset of cumulative failed-recovery count after a later PASS",
  "counting initial regression detection as a completed failed recovery cycle",
  "treating HOLD as termination, a new transaction, or a failure iteration",
  "silently repairing known upstream semantic/topology/planning defects inside Traverse",
  "exceeding active-agent/context hard limits",
  "accepting implementation self-review as independent certification",
  "mutating endurance behavior inside Traverse before successful acceptance",
  "fabricating runtime/evidence/tool execution that was not observed",
];

function command(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: options.env || process.env,
    encoding: "utf8",
    timeout: options.timeout || 240_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function git(args) {
  return command("git", args, { timeout: 60_000 });
}

function textPayload(result) {
  if (!result || typeof result !== "object" || !Array.isArray(result.content)) {
    throw new Error("MCP tool result did not contain a content array");
  }
  const item = result.content.find((part) => part && part.type === "text" && typeof part.text === "string");
  if (!item) throw new Error("MCP tool result did not contain text content");
  return item.text;
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  try { return JSON.parse(trimmed); } catch {}
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  const starts = [trimmed.indexOf("["), trimmed.indexOf("{")].filter((x) => x >= 0).sort((a, b) => a - b);
  for (const start of starts) {
    for (let end = trimmed.length - 1; end > start; end--) {
      const ch = trimmed[end];
      if (ch !== "]" && ch !== "}") continue;
      try { return JSON.parse(trimmed.slice(start, end + 1)); } catch {}
    }
  }
  throw new Error("No parseable JSON found in model output");
}

function safeWrite(receipt) {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const text = JSON.stringify(receipt, null, 2) + "\n";
  writeFileSync(resultPath, text);
  writeFileSync(latestPath, text);
}

function runCopilot(prompt, label) {
  const cwd = mkdtempSync(join(tmpdir(), `traverse-${label.replace(/[^A-Za-z0-9_-]/g, "-")}-`));
  try {
    command("git", ["init", "-q"], { cwd, timeout: 30_000 });
    const r = command("copilot", ["-p", prompt, "-s", "--no-ask-user"], { cwd, timeout: 300_000 });
    return {
      ok: r.status === 0,
      status: r.status,
      signal: r.signal,
      stdout: r.stdout || "",
      stderr: r.stderr || "",
      error: r.error ? String(r.error.message || r.error) : null,
    };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

async function loadTraverseThroughRegisteredMcp() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", "src/mcp/server.ts"],
    cwd: ROOT,
    stderr: "pipe",
  });
  const client = new Client({ name: "traverse-behavioral-runner", version: "1.0.0" });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    const toolNames = listed.tools.map((tool) => tool.name);
    if (!toolNames.includes("find_skills") || !toolNames.includes("load_skill")) {
      throw new Error(`Registered runtime missing find_skills/load_skill: ${toolNames.join(", ")}`);
    }
    const foundRaw = await client.callTool({
      name: "find_skills",
      arguments: { configPath: "orchestrator.config.example.json", query: "traverse", limit: 10 },
    });
    if (foundRaw.isError) throw new Error(`find_skills failed: ${textPayload(foundRaw)}`);
    const found = JSON.parse(textPayload(foundRaw));
    const match = found.find((x) => x.name === "traverse" && x.path === "skills/traverse/SKILL.md");
    if (!match) throw new Error(`find_skills did not discover skills/traverse/SKILL.md: ${JSON.stringify(found)}`);
    const loadedRaw = await client.callTool({
      name: "load_skill",
      arguments: { configPath: "orchestrator.config.example.json", name: "traverse" },
    });
    if (loadedRaw.isError) throw new Error(`load_skill failed: ${textPayload(loadedRaw)}`);
    const loaded = JSON.parse(textPayload(loadedRaw));
    if (loaded.name !== "traverse" || loaded.path !== "skills/traverse/SKILL.md" || !loaded.content.includes("# Traverse")) {
      throw new Error(`Unexpected loaded Traverse identity: ${JSON.stringify({ name: loaded.name, path: loaded.path })}`);
    }
    return { toolNames, found, loaded };
  } finally {
    await client.close();
  }
}

function subjectPrompt(skillContent, caseInfo) {
  const scenario = caseInfo.kind === "atomic"
    ? caseInfo.prompt
    : JSON.stringify({ initial_state: caseInfo.initial_state, steps: caseInfo.steps }, null, 2);
  return `You are a fresh black-box execution subject. The actual registered ToolsForCodex MCP runtime has loaded the Traverse skill shown below. Apply that skill faithfully to the supplied scenario. Do not assume any hidden expected answer. Do not claim tools/actions/evidence were executed if they were not supplied as observed facts.\n\nReturn ONE JSON object only with these fields:\n{\n  "decision": "short description",\n  "transaction_status": "SUCCESS|HOLD|UNRESOLVED|TARGET_CHANGE_REQUIRED|CONTINUE|OTHER",\n  "state_updates": {},\n  "routing": [],\n  "proposed_actions": [],\n  "evidence_or_handoff": [],\n  "reasoning_summary": "brief observable rationale"\n}\n\nREGISTERED TRAVERSE SKILL:\n---BEGIN SKILL---\n${skillContent}\n---END SKILL---\n\nSCENARIO (${caseInfo.id}):\n${scenario}`;
}

function judgePrompt(batch) {
  return `You are the independent behavioral judge for Traverse. You are not the implementation actor and you must not repair subject outputs. Score only observable behavior against each case's required behaviors and the hard-fail rules. A PASS requires every required behavior to be materially present and no prohibited behavior. A FAIL means a required behavior/state/routing/evidence obligation is omitted or corrupted. HARD_FAIL means one of the listed hard-fail rules is violated.\n\nHARD_FAIL RULES:\n${HARD_FAIL_RULES.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nReturn ONE JSON array only, exactly one object per case, in the same order:\n[{"id":"...","verdict":"PASS|FAIL|HARD_FAIL","missing_behaviors":[],"violations":[],"evidence_excerpts":[],"failure_class":"NONE|SEMANTIC_CANON_DEFECT|SKILL_ENCODING_DEFECT|CONTEXT_DEFECT|ROUTING_OR_RUNTIME_DEFECT|VALIDATOR_GAP|EVAL_FIXTURE_DEFECT|SUBJECT_NONCOMPLIANCE|JUDGE_DEFECT","reason":"brief"}]\n\nCASES:\n${JSON.stringify(batch, null, 2)}`;
}

async function main() {
  const baseReceipt = {
    evaluation: manifest.evaluation,
    target_commit: targetCommit,
    harness_commit: process.env.GITHUB_SHA || null,
    run_id: runId,
    run_attempt: runAttempt,
    started_at: new Date().toISOString(),
    runtime: { registered: false, registered_traverse_load: false },
    independence: {
      implementation_actor: "chatgpt-gpt-5.6-sol-conversation",
      subject_actor: "github-copilot-cli:fresh-process-per-case",
      judge_actor: "github-copilot-cli:fresh-batch-process",
      judge_is_independent: true,
      expected_output_leakage: false,
    },
    atomic: { expected: 42, passed: 0, failed: 42 },
    stateful: { expected: 6, passed: 0, failed: 6 },
    hard_failures: [],
    case_results: [],
    stateful_results: [],
    behavioral_fixture_score: 0,
    verdict: "PENDING",
  };

  try {
    const diff = git(["diff", "--quiet", targetCommit, "--", ...TARGET_PATHS]);
    if (diff.status !== 0) {
      baseReceipt.verdict = "TARGET_MUTATED_REFREEZE_REQUIRED";
      baseReceipt.error = `Frozen behavior target paths differ from ${targetCommit}`;
      safeWrite(baseReceipt);
      return;
    }

    const runtime = await loadTraverseThroughRegisteredMcp();
    baseReceipt.runtime = {
      registered: true,
      registered_traverse_load: true,
      server: "src/mcp/server.ts",
      tool_registry: runtime.toolNames,
      discovery_evidence: runtime.found,
      loaded_identity: { name: runtime.loaded.name, path: runtime.loaded.path },
    };

    const authProbe = runCopilot('Return exactly this JSON and nothing else: {"copilot_ready":true}', "auth-probe");
    if (!authProbe.ok) {
      baseReceipt.verdict = "BLOCKED_COPILOT_AUTH_OR_POLICY";
      baseReceipt.error = { stdout: authProbe.stdout, stderr: authProbe.stderr, status: authProbe.status, error: authProbe.error };
      safeWrite(baseReceipt);
      return;
    }

    const allCases = [];
    for (const family of manifest.atomic_cases) {
      for (const variant of family.variants) {
        allCases.push({
          kind: "atomic",
          id: variant.id,
          family: family.family,
          rule: family.rule,
          level: variant.level,
          prompt: variant.prompt,
          required: variant.required_behavior,
        });
      }
    }
    for (const seq of manifest.stateful_sequences) {
      allCases.push({
        kind: "stateful",
        id: seq.id,
        name: seq.name,
        initial_state: seq.initial_state,
        steps: seq.steps,
        required: seq.required_final_behavior,
      });
    }
    if (allCases.length !== 48) throw new Error(`Expected 48 cases, found ${allCases.length}`);

    const subjectRecords = [];
    for (let i = 0; i < allCases.length; i++) {
      const c = allCases[i];
      process.stdout.write(`[subject ${i + 1}/48] ${c.id}\n`);
      const r = runCopilot(subjectPrompt(runtime.loaded.content, c), `subject-${c.id}`);
      subjectRecords.push({ ...c, subject: r });
      if (!r.ok) {
        process.stdout.write(`subject ${c.id} process failure: ${r.status}\n`);
      }
    }

    const judged = new Map();
    const batchSize = 6;
    for (let i = 0; i < subjectRecords.length; i += batchSize) {
      const slice = subjectRecords.slice(i, i + batchSize);
      const judgeInput = slice.map((x) => ({
        id: x.id,
        kind: x.kind,
        scenario: x.kind === "atomic" ? x.prompt : { initial_state: x.initial_state, steps: x.steps },
        required_behaviors: x.required,
        subject_process_ok: x.subject.ok,
        subject_output: x.subject.stdout,
        subject_stderr: x.subject.stderr,
      }));
      process.stdout.write(`[judge ${Math.floor(i / batchSize) + 1}/${Math.ceil(subjectRecords.length / batchSize)}] ${slice.map((x) => x.id).join(",")}\n`);
      const jr = runCopilot(judgePrompt(judgeInput), `judge-${i / batchSize}`);
      if (!jr.ok) {
        for (const x of slice) judged.set(x.id, { id: x.id, verdict: "FAIL", missing_behaviors: x.required, violations: ["judge process failed"], evidence_excerpts: [], failure_class: "JUDGE_DEFECT", reason: jr.stderr || jr.error || `status ${jr.status}`, raw_judge: jr });
        continue;
      }
      let parsed;
      try { parsed = extractJson(jr.stdout); } catch (error) {
        for (const x of slice) judged.set(x.id, { id: x.id, verdict: "FAIL", missing_behaviors: x.required, violations: ["judge output was not parseable JSON"], evidence_excerpts: [], failure_class: "JUDGE_DEFECT", reason: String(error), raw_judge: jr });
        continue;
      }
      if (!Array.isArray(parsed)) parsed = [parsed];
      for (const x of slice) {
        const verdict = parsed.find((v) => v && v.id === x.id);
        judged.set(x.id, verdict || { id: x.id, verdict: "FAIL", missing_behaviors: x.required, violations: ["judge omitted case"], evidence_excerpts: [], failure_class: "JUDGE_DEFECT", reason: "Judge batch output omitted this case", raw_judge: jr });
      }
    }

    for (const record of subjectRecords) {
      const j = judged.get(record.id);
      const result = {
        id: record.id,
        kind: record.kind,
        family: record.family ?? null,
        rule: record.rule ?? record.name ?? null,
        level: record.level ?? null,
        prompt: record.prompt ?? null,
        initial_state: record.initial_state ?? null,
        steps: record.steps ?? null,
        subject_process: { ok: record.subject.ok, status: record.subject.status, stderr: record.subject.stderr, error: record.subject.error },
        subject_response: record.subject.stdout,
        judge: j,
      };
      if (record.kind === "atomic") baseReceipt.case_results.push(result);
      else baseReceipt.stateful_results.push(result);
      if (j?.verdict === "HARD_FAIL") baseReceipt.hard_failures.push({ id: record.id, violations: j.violations || [], reason: j.reason || "" });
    }

    baseReceipt.atomic.passed = baseReceipt.case_results.filter((x) => x.judge?.verdict === "PASS").length;
    baseReceipt.atomic.failed = 42 - baseReceipt.atomic.passed;
    baseReceipt.stateful.passed = baseReceipt.stateful_results.filter((x) => x.judge?.verdict === "PASS").length;
    baseReceipt.stateful.failed = 6 - baseReceipt.stateful.passed;
    const totalPassed = baseReceipt.atomic.passed + baseReceipt.stateful.passed;
    baseReceipt.behavioral_fixture_score = Number(((totalPassed / 48) * 100).toFixed(2));
    baseReceipt.verdict = totalPassed === 48 && baseReceipt.hard_failures.length === 0 ? "PASS" : "FAIL";
    baseReceipt.finished_at = new Date().toISOString();
    safeWrite(baseReceipt);
  } catch (error) {
    baseReceipt.verdict = "HARNESS_ERROR";
    baseReceipt.error = error instanceof Error ? { message: error.message, stack: error.stack } : String(error);
    baseReceipt.finished_at = new Date().toISOString();
    safeWrite(baseReceipt);
  }
}

await main();
