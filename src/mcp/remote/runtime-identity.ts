import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const COMMIT_RE = /^[0-9a-f]{40}$/i;
export const DEPLOYMENT_CONTRACT_VERSION = "runtime-deployment-v1";

function platformCommit(): string {
  return process.env.RENDER_GIT_COMMIT ?? process.env.GIT_COMMIT ?? "";
}

function runtimeRef(): string {
  return process.env.IDEAL_ENDURANCE_RUNTIME_REF ?? platformCommit();
}

function contractDigest(): string {
  return process.env.IDEAL_ENDURANCE_CONTRACT_DIGEST ?? "";
}

function configuredIdentity() {
  const deploymentCommit = platformCommit();
  const ref = runtimeRef();
  return {
    service: process.env.RENDER_SERVICE_NAME ?? "UNKNOWN",
    runtime: "ideal-endurance",
    contract_version: DEPLOYMENT_CONTRACT_VERSION,
    deployment_commit: deploymentCommit || "UNKNOWN",
    runtime_ref: ref || "UNKNOWN",
    branch: process.env.RENDER_GIT_BRANCH ?? process.env.GIT_BRANCH ?? "UNKNOWN",
    contract_digest: contractDigest() || "UNCONFIGURED",
    checks: {
      ref_is_immutable: COMMIT_RE.test(ref),
      ref_matches_deployment: Boolean(deploymentCommit) && ref === deploymentCommit,
      runtime_connected: process.env.IDEAL_ENDURANCE_RUNTIME_CONNECTED === "true",
      contract_digest_present: Boolean(contractDigest()),
    },
  };
}

export function runtimeIdentityPayload() {
  const identity = configuredIdentity();
  return {
    ...identity,
    identity_status:
      identity.checks.ref_is_immutable &&
      identity.checks.ref_matches_deployment &&
      identity.checks.contract_digest_present
        ? "VERIFIED"
        : "BLOCKED",
  };
}

function authorized(req: IncomingMessage): boolean {
  const expected = process.env.DEPLOYMENT_PROOF_TOKEN;
  const supplied = req.headers.authorization;
  if (!expected || typeof supplied !== "string" || !supplied.startsWith("Bearer ")) return false;
  const actual = Buffer.from(supplied.slice("Bearer ".length));
  const target = Buffer.from(expected);
  return actual.length === target.length && timingSafeEqual(actual, target);
}

export function writeRuntimeIdentity(res: ServerResponse): void {
  const body = JSON.stringify(runtimeIdentityPayload());
  res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(body);
}

export function writeRuntimeProof(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json", Allow: "POST" });
    res.end(JSON.stringify({ proof_status: "BLOCKED", reason: "POST_REQUIRED" }));
    return;
  }
  if (!authorized(req)) {
    res.writeHead(401, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ proof_status: "BLOCKED", reason: "AUTH_REQUIRED" }));
    return;
  }
  const identity = runtimeIdentityPayload();
  const checks = identity.checks;
  if (!checks.ref_is_immutable || !checks.ref_matches_deployment) {
    res.writeHead(409, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({
      proof_status: "BLOCKED",
      reason: "IMMUTABLE_REF_MISMATCH",
      runtime_ref: identity.runtime_ref,
      deployment_commit: identity.deployment_commit,
    }));
    return;
  }
  if (!checks.contract_digest_present || !checks.runtime_connected) {
    res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({
      proof_status: "BLOCKED",
      reason: "RUNTIME_NOT_CONNECTED",
      runtime_ref: identity.runtime_ref,
      deployment_commit: identity.deployment_commit,
      contract_version: identity.contract_version,
      contract_digest: identity.contract_digest,
      checks,
      next_legal_action: "Connect current Ideal-Endurance runtime and set its contract digest.",
    }));
    return;
  }
  const response = {
    proof_status: "VERIFIED",
    runtime_ref: identity.runtime_ref,
    deployment_commit: identity.deployment_commit,
    contract_version: identity.contract_version,
    contract_digest: identity.contract_digest,
    response_hash: createHash("sha256").update(JSON.stringify(identity)).digest("hex"),
    checks,
  };
  res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(response));
}
