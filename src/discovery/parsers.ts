import { basename, extname } from "node:path";
import ts from "typescript";
import type { Diagnostic, DiscoveredRecord } from "../domain/records";

export interface ParsedAsset { readonly kind: string; readonly data: Record<string, unknown> }

function diagnostic(record: DiscoveredRecord, reason: string, line?: number, column?: number): Diagnostic {
  return { schemaVersion: "1.0", id: `diagnostic-${record.path.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "") || "root"}`, createdAt: "1970-01-01T00:00:00.000Z", severity: "error", status: "INVALID", source: { locator: record.locator }, reason, ...(line === undefined ? {} : { line }), ...(column === undefined ? {} : { column }), evidence: [{ kind: "parser", locator: record.locator }] };
}

export function parseRecord(record: DiscoveredRecord): { parsed?: ParsedAsset; diagnostics: readonly Diagnostic[] } {
  if (!record.content || record.parseStatus !== "PARSED") return { diagnostics: [] };
  const extension = record.extension ?? extname(record.path).toLowerCase();
  const text = record.content;
  if (extension === ".json" || basename(record.path).toLowerCase() === "package.json") {
    try { return { parsed: { kind: "json", data: JSON.parse(text) as Record<string, unknown> }, diagnostics: [] }; }
    catch (error) { return { diagnostics: [diagnostic(record, error instanceof Error ? error.message : "Invalid JSON")] }; }
  }
  if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(extension)) {
    const source = ts.createSourceFile(record.path, text, ts.ScriptTarget.Latest, true);
    const syntaxErrors = ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }, fileName: record.path, reportDiagnostics: true }).diagnostics ?? [];
    const firstError = syntaxErrors[0];
    if (firstError) {
      const position = source.getLineAndCharacterOfPosition(firstError.start ?? 0);
      return { diagnostics: [diagnostic(record, ts.flattenDiagnosticMessageText(firstError.messageText, " "), position.line + 1, position.character + 1)] };
    }
    return { parsed: { kind: "typescript", data: { statements: source.statements.length } }, diagnostics: [] };
  }
  if (extension === ".md" || extension === ".markdown") {
    const frontmatter: Record<string, unknown> = {};
    if (text.startsWith("---\n") || text.startsWith("---\r\n")) {
      const end = text.indexOf("\n---", 4);
      if (end < 0) return { diagnostics: [diagnostic(record, "Unterminated YAML frontmatter")] };
      for (const line of text.slice(4, end).split(/\r?\n/)) {
        const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
        if (match?.[1] && match[2] !== undefined) frontmatter[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    }
    return { parsed: { kind: "markdown", data: { frontmatter, hasPromptInjectionMarkers: /ignore previous|system message|developer instruction/i.test(text) } }, diagnostics: [] };
  }
  if (extension === ".yml" || extension === ".yaml") {
    if (/\t/.test(text) || (/\[[^\]]*$/.test(text) && !/\]/.test(text))) return { diagnostics: [diagnostic(record, "Malformed YAML indentation or collection")] };
    const keys = [...text.matchAll(/^\s*([A-Za-z0-9_-]+):/gm)].map((match) => match[1]);
    return { parsed: { kind: "yaml", data: { topLevelKeys: [...new Set(keys)] } }, diagnostics: [] };
  }
  return { parsed: { kind: "text", data: { length: text.length } }, diagnostics: [] };
}
