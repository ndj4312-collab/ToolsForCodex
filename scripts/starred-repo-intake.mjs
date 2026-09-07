#!/usr/bin/env node

import https from "node:https";
import { readFile } from "node:fs/promises";

const DIRECT_OVERLAP = [
  /agent/i,
  /claude/i,
  /codex/i,
  /copilot/i,
  /skill/i,
  /mcp/i,
  /n8n/i,
  /prompt/i,
  /memory/i,
  /llm/i,
  /design-md/i,
  /archify/i
];

const PERMISSIVE_LICENSES = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "CC0-1.0"
]);

const REVIEW_LICENSES = new Set([
  "NOASSERTION",
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "LGPL-2.1",
  "LGPL-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0"
]);

function usage() {
  return [
    "Usage: GITHUB_TOKEN=... npm run starred:intake -- [--format json|markdown] [--max-pages N]",
    "       npm run starred:intake -- --from-file stars.json [--format json|markdown]",
    "",
    "Lists authenticated GitHub stars and classifies access/session usability.",
    "The token is read only from GITHUB_TOKEN or GH_TOKEN and is never printed."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { format: "json", maxPages: 10, fromFile: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    if (arg === "--format") {
      args.format = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--max-pages") {
      args.maxPages = Number.parseInt(argv[index + 1] ?? "", 10);
      index += 1;
      continue;
    }
    if (arg === "--from-file") {
      args.fromFile = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["json", "markdown"].includes(args.format)) {
    throw new Error("--format must be json or markdown");
  }
  if (!Number.isInteger(args.maxPages) || args.maxPages < 1 || args.maxPages > 50) {
    throw new Error("--max-pages must be an integer from 1 through 50");
  }
  if (args.fromFile !== null && args.fromFile.length === 0) {
    throw new Error("--from-file requires a path");
  }

  return args;
}

function requestJson(url, token) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
          "user-agent": "toolsforcodex-starred-intake",
          "x-github-api-version": "2022-11-28"
        }
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if ((response.statusCode ?? 500) >= 400) {
            reject(new Error(`GitHub request failed with HTTP ${response.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
    request.end();
  });
}

async function fetchStarredRepos(token, maxPages) {
  const repos = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await requestJson(`https://api.github.com/user/starred?per_page=100&page=${page}`, token);
    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }
    repos.push(...batch);
  }

  return repos
    .filter((repo, index, all) => all.findIndex((candidate) => candidate.full_name === repo.full_name) === index)
    .sort((left, right) => left.full_name.localeCompare(right.full_name));
}

function licenseState(spdxId) {
  if (PERMISSIVE_LICENSES.has(spdxId)) {
    return "LICENSE_METADATA_PERMISSIVE";
  }
  if (REVIEW_LICENSES.has(spdxId)) {
    return "LICENSE_NEEDS_REVIEW_BEFORE_COPY_OR_ADAPT";
  }
  return "LICENSE_UNKNOWN";
}

function relevanceBand(repo) {
  const haystack = `${repo.full_name} ${repo.description ?? ""} ${repo.language ?? ""}`;
  if (DIRECT_OVERLAP.some((pattern) => pattern.test(haystack))) {
    return "DIRECT_TOOLSFORCODEX_OVERLAP";
  }
  if (/api|data|engineering|system|design|automation|workflow|ops|sre|selfhosted/i.test(haystack)) {
    return "SECONDARY_UTILITY_OVERLAP";
  }
  return "DOMAIN_OR_LEARNING_OVERLAP";
}

function classify(repo) {
  const spdxId = repo.license?.spdx_id ?? "NOASSERTION";
  const publicRepo = repo.private !== true;
  const accessStates = ["METADATA_READABLE"];
  const sessionUse = [];

  if (publicRepo) {
    accessStates.push("STATIC_FILES_READABLE", "CLONEABLE_CLOUD", "CLONEABLE_LOCAL", "REMOTE_MCP_READABLE");
    sessionUse.push("cloud:cloneable", "local:cloneable", "remote-mcp:public-static-readable");
  } else {
    accessStates.push("PRIVATE_AUTH_REQUIRED");
    sessionUse.push("cloud:requires-token", "local:requires-token", "remote-mcp:needs-token-aware-adapter");
  }

  if (repo.archived) {
    sessionUse.push("archived:static-only-until-reviewed");
  }

  return {
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    defaultBranch: repo.default_branch,
    pushedAt: repo.pushed_at,
    archived: repo.archived,
    fork: repo.fork,
    private: repo.private,
    language: repo.language ?? "UNKNOWN",
    sizeKb: repo.size,
    licenseSpdx: spdxId,
    accessStates,
    sessionUse,
    licenseState: licenseState(spdxId),
    relevanceBand: relevanceBand(repo),
    nextInspection: "quarantine-clone-and-static-screen-before-import-or-execution",
    description: repo.description ?? ""
  };
}

function markdown(records) {
  const lines = [
    "# Starred Repository Intake",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "No target repository code was executed. This report classifies access and session usability only; it does not decide final import value.",
    "",
    "| Repository | Relevance | License | Access | Session use | Next inspection |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const record of records) {
    lines.push([
      `| ${record.fullName}`,
      record.relevanceBand,
      `${record.licenseSpdx} / ${record.licenseState}`,
      record.accessStates.join(", "),
      record.sessionUse.join(", "),
      `${record.nextInspection} |`
    ].join(" | "));
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const repos = args.fromFile
    ? JSON.parse(await readFile(args.fromFile, "utf8"))
    : await fetchStarredReposFromToken(args.maxPages);
  const records = repos.map(classify);
  if (args.format === "markdown") {
    process.stdout.write(markdown(records));
    return;
  }

  process.stdout.write(`${JSON.stringify({ generatedAt: new Date().toISOString(), count: records.length, records }, null, 2)}\n`);
}

async function fetchStarredReposFromToken(maxPages) {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN or GH_TOKEN");
  }
  return fetchStarredRepos(token, maxPages);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
