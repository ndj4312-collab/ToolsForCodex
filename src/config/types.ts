export type Runtime = "claude" | "codex" | "gemini" | "generic-agents";
export type SecurityMode = "read-only" | "approved-transactions";
export type DistributionMode = "claude-plugin" | "skills-sh-editable" | "skillshare-approved-sync";

export interface OrchestratorConfig {
  readonly schemaVersion: "1.0";
  readonly targetRoot: string;
  readonly auditIgnore: readonly string[];
  readonly allowedWriteRoots: readonly string[];
  readonly enabledRuntimes: readonly Runtime[];
  readonly securityMode: SecurityMode;
  readonly outputDirectory: string;
  readonly distributionMode?: DistributionMode;
  readonly requiredEnvironment?: readonly string[];
}

export interface VerifiedPreflight {
  readonly schemaVersion: "1.0";
  readonly status: "VERIFIED";
  readonly timestamp: string;
  readonly targetRoot: string;
  readonly configPath: string;
  readonly evidence: readonly [{ readonly type: "config-schema"; readonly locator: string; readonly sha256: string }];
}
