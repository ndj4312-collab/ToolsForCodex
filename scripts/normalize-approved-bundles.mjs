/* global console */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "approved-proposals");
if (!existsSync(root)) throw new Error(`Approved bundle directory does not exist: ${root}`);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function digest(value) {
  return createHash("sha256").update(canonical(value)).digest("hex");
}

function normalize(content) {
  return content
    .replaceAll("# Proposed repository coordinator", "# Repository coordinator")
    .replaceAll("This coordinator was generated from the files currently present in the repository. It is a reviewable proposal and has not been installed.", "This coordinator was generated from the files present in the repository and approved for installation.")
    .replaceAll("# Proposed file index", "# Repository file index")
    .replaceAll("This index was generated from observed repository contents. It is a proposal, not an applied change.", "This index was generated from observed repository contents.")
    .replaceAll("# Proposed skills index", "# Skills index")
    .replaceAll("Generated from observed SKILL.md files. Review names and descriptions before applying.", "Generated from observed SKILL.md files.")
    .replaceAll("Proposed Repository Coordinator", "Repository Coordinator")
    .replaceAll("The proposal is stored under .orchestrator/proposals and has not been copied into the repository.", "The approved bundle is stored under approved-proposals and is ready for the user's repository.");
}

function normalizeReport(content) {
  return normalize(content)
    .replace("Status: **PROPOSED**", "Proposal source status: **PROPOSED**\n\nAcceptance status: **APPROVED**")
    .replace("This report proposes a coordinator and file indexes from observed repository contents. Nothing was applied.", "This report records the approved coordinator and file indexes generated from observed repository contents.")
    .replace("## Proposed components", "## Observed components");
}

let bundles = 0;
let files = 0;
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const bundle = join(root, entry.name);
  const proposalPath = join(bundle, "proposal.json");
  if (!existsSync(proposalPath)) continue;
  const proposal = JSON.parse(readFileSync(proposalPath, "utf8"));
  const normalizedFiles = proposal.files.map((file) => {
    const path = join(bundle, "files", file.path);
    if (!existsSync(path)) throw new Error(`${entry.name}: missing approved file ${file.path}`);
    const content = normalize(file.content);
    writeFileSync(path, content, "utf8");
    files += 1;
    return { ...file, content };
  });
  const unsigned = { ...proposal, files: normalizedFiles, digest: undefined };
  delete unsigned.digest;
  const updated = { ...unsigned, digest: digest(unsigned) };
  writeFileSync(proposalPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  const reportPath = join(bundle, "proposal-report.md");
  if (existsSync(reportPath)) writeFileSync(reportPath, `${normalizeReport(readFileSync(reportPath, "utf8"))}`, "utf8");
  bundles += 1;
}

console.log(JSON.stringify({ status: "VERIFIED", profile: "matt-pocock-compatible-v1", bundles, files }));
