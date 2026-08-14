import { discover } from "../discovery/walker";

export interface StyleContractResult { readonly status: "VERIFIED" | "BLOCKED" | "UNKNOWN"; readonly contracts: readonly { name: string; locator: string }[]; readonly reason?: string }
export function resolveStyleContract(root: string): StyleContractResult {
  const contracts: { name: string; locator: string }[] = [];
  for (const record of discover(root, [".git", "node_modules", ".orchestrator"]).records) {
    if (record.path === "src/normalization/style-contract.ts" || !record.content || !/\.(md|json|yaml|yml|ts|js)$/i.test(record.path)) continue;
    if (/(^|[\\/])style[-_ ]?contract\.(json|ya?ml|md)$/i.test(record.path)) contracts.push({ name: record.path, locator: record.locator });
  }
  if (contracts.length > 1) return { status: "BLOCKED", contracts, reason: "Multiple style contracts were detected; declare one canonical owner" };
  if (contracts.length === 1) return { status: "VERIFIED", contracts };
  return { status: "UNKNOWN", contracts, reason: "No declared style contract was found; evidence is required before style normalization" };
}
