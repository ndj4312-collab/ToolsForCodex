/* global URL, console */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\//, "").replaceAll("/", "\\");
const forbidden = [];
for (const directory of ["src", "skills", "contracts", "docs"]) {
  const path = join(root, directory);
  if (!existsSync(path)) forbidden.push(`${directory} missing`);
}
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !["node_modules", "dist", "coverage", ".orchestrator", ".git"].includes(entry.name)) walk(path);
    else if (/\.(ts|md|json|yaml|yml)$/.test(entry.name) && /\b(?:TODO|PLACEHOLDER|TBD)\b/.test(readFileSync(path, "utf8"))) forbidden.push(`${path} contains placeholder text`);
  }
}
walk(root);
if (forbidden.length) { console.error(forbidden.join("\n")); process.exit(1); }
console.log(JSON.stringify({ status: "VERIFIED", checked: ["src", "skills", "contracts", "docs"] }));
