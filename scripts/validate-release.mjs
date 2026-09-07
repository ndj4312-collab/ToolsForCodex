/* global URL, console */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const forbidden = [];
const checkedDirectories = ["src", "skills", "contracts", "docs"];
for (const directory of checkedDirectories) {
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
for (const directory of checkedDirectories) walk(join(root, directory));
if (forbidden.length) { console.error(forbidden.join("\n")); process.exit(1); }
console.log(JSON.stringify({ status: "VERIFIED", checked: checkedDirectories }));
