import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Sporadic, single-session remote use: each MCP session shallow-clones its
 * target repo once (on `set_target`), reuses that checkout for every tool
 * call in the session, and is discarded on session close or after an idle
 * timeout. There is no persistence across sessions and no shared state
 * between concurrent sessions beyond the process they run in.
 */

interface SessionTarget {
  repoDir: string;
  configPath: string;
  repoUrl: string;
  ref: string | undefined;
  lastUsed: number;
}

const sessions = new Map<string, SessionTarget>();
const IDLE_MS = 30 * 60 * 1000;

const DEFAULT_CONFIG = {
  schemaVersion: "1.0",
  targetRoot: ".",
  auditIgnore: ["node_modules", "dist", ".git"],
  allowedWriteRoots: [],
  enabledRuntimes: ["claude", "codex", "gemini"],
  securityMode: "read-only",
  outputDirectory: ".orchestrator",
  distributionMode: "skills-sh-editable",
  requiredEnvironment: [],
};

function assertGitAvailable(): void {
  const check = spawnSync("git", ["--version"]);
  if (check.status !== 0) {
    throw new Error("git is not available in this deployment's runtime image; clone-based remote targets cannot work without it.");
  }
}

export function cleanupSession(sessionId: string): void {
  const target = sessions.get(sessionId);
  if (!target) return;
  sessions.delete(sessionId);
  try {
    rmSync(target.repoDir, { recursive: true, force: true });
  } catch {
    // best effort — an orphaned tmp dir is not worth failing the request over
  }
}

export function setTarget(sessionId: string, repoUrl: string, ref?: string): { targetRoot: string; configPath: string } {
  assertGitAvailable();
  cleanupSession(sessionId);
  const repoDir = mkdtempSync(join(tmpdir(), "toolsforcodex-"));
  const cloneArgs = ["clone", "--depth", "1", ...(ref ? ["--branch", ref] : []), repoUrl, repoDir];
  const result = spawnSync("git", cloneArgs, { timeout: 60_000 });
  if (result.status !== 0) {
    rmSync(repoDir, { recursive: true, force: true });
    const stderr = result.stderr ? result.stderr.toString("utf8").trim() : "unknown error";
    throw new Error(`Failed to clone ${repoUrl}${ref ? `#${ref}` : ""}: ${stderr}`);
  }
  const configPath = join(repoDir, "toolsforcodex.session.config.json");
  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  sessions.set(sessionId, { repoDir, configPath, repoUrl, ref, lastUsed: Date.now() });
  return { targetRoot: repoDir, configPath };
}

export function resolveConfigPath(explicit: string | undefined, sessionId: string | undefined): string {
  if (explicit) return explicit;
  if (sessionId) {
    const target = sessions.get(sessionId);
    if (target) {
      target.lastUsed = Date.now();
      return target.configPath;
    }
  }
  throw new Error("No target set for this session. Call set_target with a repoUrl first.");
}

const sweepHandle = setInterval(() => {
  const now = Date.now();
  for (const [sessionId, target] of sessions) {
    if (now - target.lastUsed > IDLE_MS) cleanupSession(sessionId);
  }
}, 5 * 60 * 1000);
sweepHandle.unref();
