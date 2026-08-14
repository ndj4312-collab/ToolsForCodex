export type ParseStatus = "PARSED" | "EMPTY" | "UNREADABLE" | "BINARY" | "UNSUPPORTED_ENCODING" | "SYMLINK" | "DIRECTORY";
export type ClassificationDomain = "Cross-Agent Tools" | "CI/CD & Automation" | "Security" | "State Management" | "Testing" | "Build Tooling" | "Documentation" | "Data" | "Observability" | "Deployment" | "Unsupported" | "UNKNOWN";

export interface DiscoveredRecord {
  readonly path: string;
  readonly kind: "file" | "directory" | "symlink";
  readonly sha256?: string;
  readonly size?: number;
  readonly parseStatus: ParseStatus;
  readonly reason?: string;
  readonly locator: string;
  readonly content?: string;
  readonly extension?: string;
  readonly classifications?: readonly ClassificationDomain[];
  readonly competingRuleIds?: readonly string[];
}

export interface Diagnostic {
  readonly schemaVersion: "1.0";
  readonly id: string;
  readonly createdAt: string;
  readonly severity: "info" | "warning" | "error" | "critical";
  readonly status: "VERIFIED" | "WARNING" | "UNKNOWN" | "BLOCKED" | "INVALID";
  readonly source: { readonly locator: string };
  readonly reason: string;
  readonly line?: number;
  readonly column?: number;
  readonly evidence: readonly { readonly kind: string; readonly locator: string }[];
}

export interface CatalogAsset {
  readonly id: string;
  readonly path: string;
  readonly kind: DiscoveredRecord["kind"];
  readonly sha256?: string;
  readonly size?: number;
  readonly parseStatus: ParseStatus;
  readonly reason?: string;
  readonly classifications: readonly ClassificationDomain[];
  readonly locations?: readonly string[];
}

export interface CatalogResult {
  readonly schemaVersion: "1.0";
  readonly id: string;
  readonly generatedAt: string;
  readonly targetPath: string;
  readonly exclusions: readonly string[];
  readonly assets: readonly CatalogAsset[];
  readonly overallDigest: string;
  readonly evidence: readonly { readonly kind: string; readonly locator: string }[];
  readonly diagnostics: readonly Diagnostic[];
}
