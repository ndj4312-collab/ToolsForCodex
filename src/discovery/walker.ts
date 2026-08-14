import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { createHash } from "node:crypto";
import type { DiscoveredRecord } from "../domain/records";

const DEFAULT_IGNORES = [".git", "node_modules", ".orchestrator", "dist", "coverage", "build", ".cache"] as const;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function recordFile(root: string, absolutePath: string, relativePath: string): DiscoveredRecord {
  const locator = `file://${absolutePath}`;
  try {
    const stat = lstatSync(absolutePath);
    if (stat.size > MAX_FILE_BYTES) return { path: relativePath, kind: "file", size: stat.size, parseStatus: "UNREADABLE", reason: `file exceeds ${MAX_FILE_BYTES} bytes`, locator };
    const bytes = readFileSync(absolutePath);
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (bytes.includes(0)) return { path: relativePath, kind: "file", size: stat.size, sha256: sha, parseStatus: "BINARY", reason: "NUL byte detected", locator, extension: extname(relativePath).toLowerCase() };
    const content = bytes.toString("utf8");
    if (content.includes("\ufffd")) return { path: relativePath, kind: "file", size: stat.size, sha256: sha, parseStatus: "UNSUPPORTED_ENCODING", reason: "UTF-8 replacement character detected", locator, extension: extname(relativePath).toLowerCase() };
    return { path: relativePath, kind: "file", size: stat.size, sha256: sha, parseStatus: content.length === 0 ? "EMPTY" : "PARSED", locator, content, extension: extname(relativePath).toLowerCase() };
  } catch (error) {
    return { path: relativePath, kind: "file", parseStatus: "UNREADABLE", reason: error instanceof Error ? error.message : "UNKNOWN", locator };
  }
}

export function discover(root: string, configuredIgnores: readonly string[] = []): { records: readonly DiscoveredRecord[]; exclusions: readonly string[] } {
  const exclusions = [...new Set([...DEFAULT_IGNORES, ...configuredIgnores])].sort();
  const records: DiscoveredRecord[] = [];
  function walk(directory: string): void {
    let entries;
    try { entries = readdirSync(directory, { withFileTypes: true }); } catch (error) {
      records.push({ path: relative(root, directory).replaceAll("\\", "/") || ".", kind: "directory", parseStatus: "UNREADABLE", reason: error instanceof Error ? error.message : "UNKNOWN", locator: `file://${directory}` });
      return;
    }
    if (entries.length === 0) records.push({ path: relative(root, directory).replaceAll("\\", "/") || ".", kind: "directory", parseStatus: "DIRECTORY", reason: "empty directory", locator: `file://${directory}` });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const child = join(directory, entry.name);
      const childRelative = relative(root, child).replaceAll("\\", "/");
      if (exclusions.some((ignored) => childRelative === ignored || childRelative.startsWith(`${ignored}/`))) continue;
      try {
        if (entry.isSymbolicLink()) {
          records.push({ path: childRelative, kind: "symlink", parseStatus: "SYMLINK", reason: "symlinks are cataloged but never followed", locator: `file://${child}` });
        } else if (entry.isDirectory()) {
          records.push({ path: childRelative, kind: "directory", parseStatus: "DIRECTORY", locator: `file://${child}` });
          walk(child);
        } else if (entry.isFile()) records.push(recordFile(root, child, childRelative));
      } catch (error) {
        records.push({ path: childRelative, kind: "file", parseStatus: "UNREADABLE", reason: error instanceof Error ? error.message : "UNKNOWN", locator: `file://${child}` });
      }
    }
  }
  walk(root);
  return { records: records.sort((a, b) => a.path.localeCompare(b.path)), exclusions };
}
