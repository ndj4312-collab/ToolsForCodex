import { preflight, PreflightError } from "./config/load";

function usage(): string {
  return "Usage: orchestrator preflight --config <path>";
}

function parseArguments(argumentsList: readonly string[]): { command: string; configPath: string } {
  const [command, flag, configPath, ...extra] = argumentsList;
  if (command !== "preflight" || flag !== "--config" || !configPath || extra.length > 0) throw new PreflightError(usage());
  return { command, configPath };
}

function main(): void {
  try {
    const { configPath } = parseArguments(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(preflight(configPath))}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    process.stderr.write(`${JSON.stringify({ status: "INVALID", error: message })}\n`);
    process.exitCode = 1;
  }
}

main();
